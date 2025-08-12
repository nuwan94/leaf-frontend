import SidebarLayout from '@/components/layouts/SidebarLayout';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import localizationService from '@/lib/services/localizationService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Copy, Loader2, Pencil, Save, Trash2, X } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table.jsx';

// Separate stable input components to prevent re-renders and fix focus issues
const EditableKeyInput = React.memo(({ value, onChange, autoFocus, rowKey }) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      // Use setTimeout to ensure DOM is ready
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 0);
    }
  }, [autoFocus]);

  const handleChange = useCallback(
    (e) => {
      onChange(e);
    },
    [onChange]
  );

  return (
    <Input
      ref={inputRef}
      value={value}
      onChange={handleChange}
      placeholder="Enter key"
      className="w-full min-w-[200px]"
      autoComplete="off"
    />
  );
});

const EditableValueInput = React.memo(({ value, onChange, rowKey }) => {
  const handleChange = useCallback(
    (e) => {
      onChange(e);
    },
    [onChange]
  );

  return (
    <Input
      value={value}
      onChange={handleChange}
      placeholder="Enter value"
      className="w-full min-w-[300px]"
      autoComplete="off"
    />
  );
});

const EditableLangSelect = React.memo(({ value, onChange, rowKey }) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full min-w-[120px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en">English</SelectItem>
        <SelectItem value="si">Sinhala</SelectItem>
        <SelectItem value="ta">Tamil</SelectItem>
      </SelectContent>
    </Select>
  );
});

export default function AdminLocalization() {
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });
  const [pageCount, setPageCount] = useState(0);
  const [editing, setEditing] = useState({});
  const [editValues, setEditValues] = useState({});
  const [savingKey, setSavingKey] = useState(null);
  const [newRows, setNewRows] = useState([]);
  const [nextTempId, setNextTempId] = useState(1);
  const [deletingKey, setDeletingKey] = useState(null);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchMessages = useCallback(
    async (query = '') => {
      setLoading(true);
      setError(null);
      try {
        const res = await localizationService.getAllMessages(
          pagination.pageIndex + 1,
          pagination.pageSize,
          query
        );
        if (res.success) {
          setMessages(res.messages || []);
          setPageCount(res.pagination?.total_pages || 1);
          setTotalItems(res.pagination?.total_items || 0);
        } else {
          setError('Failed to load messages');
        }
      } catch {
        setError('Failed to load messages');
      } finally {
        setLoading(false);
      }
    },
    [pagination.pageIndex, pagination.pageSize]
  );

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const getRowKey = useCallback((msg) => {
    if (msg._tempId) {
      return `temp_${msg._tempId}`;
    }
    return `existing_${msg.lang}_${msg.key}`;
  }, []);

  const startEdit = useCallback(
    (msg) => {
      const rowKey = getRowKey(msg);
      setEditing((prev) => ({ ...prev, [rowKey]: true }));
      setEditValues((prev) => ({
        ...prev,
        [rowKey]: {
          key: msg.key || '',
          lang: msg.lang || 'en',
          value: msg.value || '',
        },
      }));
    },
    [getRowKey]
  );

  const cancelEdit = useCallback(
    (msg) => {
      const rowKey = getRowKey(msg);
      setEditing((prev) => {
        const newEditing = { ...prev };
        delete newEditing[rowKey];
        return newEditing;
      });
      setEditValues((prev) => {
        const newValues = { ...prev };
        delete newValues[rowKey];
        return newValues;
      });

      if (msg._tempId && msg._isNew) {
        setNewRows((prev) => prev.filter((row) => row._tempId !== msg._tempId));
      }
    },
    [getRowKey]
  );

  const saveEdit = useCallback(
    async (msg) => {
      const rowKey = getRowKey(msg);
      setSavingKey(rowKey);
      setError(null);

      try {
        const editData = editValues[rowKey];

        if (msg._isNew) {
          await localizationService.createMessage({
            lang: editData.lang,
            key: editData.key,
            value: editData.value,
          });
          setNewRows((prev) => prev.filter((row) => row._tempId !== msg._tempId));
        } else {
          await localizationService.updateMessage({
            lang: editData.lang,
            key: editData.key,
            value: editData.value,
          });
        }

        setMessages((prevMessages) =>
          prevMessages.map((message) =>
            message.key === msg.key && message.lang === msg.lang
              ? { ...message, lang: editData.lang, value: editData.value }
              : message
          )
        );

        setEditing((prev) => {
          const newEditing = { ...prev };
          delete newEditing[rowKey];
          return newEditing;
        });
        setEditValues((prev) => {
          const newValues = { ...prev };
          delete newValues[rowKey];
          return newValues;
        });

        await fetchMessages();
      } catch {
        setError('Failed to save message');
      } finally {
        setSavingKey(null);
      }
    },
    [getRowKey, editValues, fetchMessages]
  );

  const deleteLocale = useCallback(
    async (msg) => {
      const rowKey = getRowKey(msg);
      setDeletingKey(rowKey);
      setError(null);
      try {
        await localizationService.deleteMessage(msg.lang, msg.key);
        await fetchMessages();
      } catch {
        setError('Failed to delete message');
      } finally {
        setDeletingKey(null);
      }
    },
    [getRowKey, fetchMessages]
  );

  const handleAddRow = useCallback(() => {
    const tempId = nextTempId;
    setNextTempId((prev) => prev + 1);

    const newRow = {
      _tempId: tempId,
      _isNew: true,
      key: '',
      lang: 'en',
      value: '',
    };

    setNewRows((prev) => [newRow, ...prev]); // Add new row to the top
    startEdit(newRow);
  }, [nextTempId, startEdit]);

  const handleDuplicateRow = useCallback(
    (originalRow) => {
      const tempId = nextTempId;
      setNextTempId((prev) => prev + 1);

      const duplicatedRow = {
        _tempId: tempId,
        _isNew: true,
        key: `${originalRow.key}_copy`,
        lang: originalRow.lang,
        value: originalRow.value,
      };

      setNewRows((prev) => [...prev, duplicatedRow]);
      startEdit(duplicatedRow);
    },
    [nextTempId, startEdit]
  );

  const handleDeleteNewRow = useCallback((tempId) => {
    setNewRows((prev) => prev.filter((row) => row._tempId !== tempId));
    const tempKey = `temp_${tempId}`;
    setEditing((prev) => {
      const newEditing = { ...prev };
      delete newEditing[tempKey];
      return newEditing;
    });
    setEditValues((prev) => {
      const newValues = { ...prev };
      delete newValues[tempKey];
      return newValues;
    });
  }, []);

  const allData = useMemo(() => [...messages, ...newRows], [messages, newRows]);

  const updateEditValue = useCallback((rowKey, field, value) => {
    setEditValues((prev) => ({
      ...prev,
      [rowKey]: { ...prev[rowKey], [field]: value },
    }));
  }, []);

  const columns = useMemo(
    () => [
      {
        id: 'key',
        header: 'Key',
        width: '200px',
        cell: ({ row }) => {
          const msg = row.original;
          const rowKey = getRowKey(msg);
          const isEditing = editing[rowKey];

          if (isEditing) {
            return (
              <EditableKeyInput
                key={`${rowKey}_key`}
                rowKey={rowKey}
                value={editValues[rowKey]?.key || ''}
                onChange={(e) => updateEditValue(rowKey, 'key', e.target.value)}
                autoFocus={msg._isNew}
              />
            );
          }

          return (
            <div className="font-medium">
              {msg.key}
              {msg._isNew && <span className="ml-2 text-xs text-blue-500">(New)</span>}
            </div>
          );
        },
      },
      {
        id: 'lang',
        header: 'Language',
        width: '100px',
        cell: ({ row }) => {
          const msg = row.original;
          const rowKey = getRowKey(msg);
          const isEditing = editing[rowKey];

          if (isEditing) {
            return (
              <EditableLangSelect
                key={`${rowKey}_lang`}
                rowKey={rowKey}
                value={editValues[rowKey]?.lang || 'en'}
                onChange={(value) => updateEditValue(rowKey, 'lang', value)}
              />
            );
          }

          return <div className="uppercase font-medium">{msg.lang}</div>;
        },
      },
      {
        id: 'value',
        header: 'Value',
        width: '400px',
        cell: ({ row }) => {
          const msg = row.original;
          const rowKey = getRowKey(msg);
          const isEditing = editing[rowKey];

          if (isEditing) {
            return (
              <EditableValueInput
                key={`${rowKey}_value`}
                rowKey={rowKey}
                value={editValues[rowKey]?.value || ''}
                onChange={(e) => updateEditValue(rowKey, 'value', e.target.value)}
              />
            );
          }

          return (
            <div className="max-w-[300px] truncate" title={msg.value}>
              {msg.value}
            </div>
          );
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        width: '250px',
        cell: ({ row }) => {
          const msg = row.original;
          const rowKey = getRowKey(msg);
          const isEditing = editing[rowKey];
          const isValidForSave = editValues[rowKey]?.key && editValues[rowKey]?.value;
          const isSaving = savingKey === rowKey;
          const isDeleting = deletingKey === rowKey;

          if (isEditing) {
            return (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={isSaving || !isValidForSave ? 'outline' : undefined}
                  onClick={() => saveEdit(msg)}
                  disabled={isSaving || !isValidForSave}
                  className="flex items-center gap-1"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span>Save</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => cancelEdit(msg)}
                  className="flex items-center gap-1"
                >
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </Button>
                {msg._isNew && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteNewRow(msg._tempId)}
                    className="flex items-center gap-1"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
                  </Button>
                )}
              </div>
            );
          }

          return (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => startEdit(msg)}
                className="flex items-center gap-1"
              >
                <Pencil className="h-4 w-4" />
                <span>Edit</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDuplicateRow(msg)}
                className="flex items-center gap-1"
              >
                <Copy className="h-4 w-4" />
                <span>Duplicate</span>
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => deleteLocale(msg)}
                disabled={isDeleting}
                className="flex items-center gap-1"
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                <span>Delete</span>
              </Button>
            </div>
          );
        },
      },
    ],
    [
      editing,
      editValues,
      savingKey,
      deletingKey,
      getRowKey,
      updateEditValue,
      saveEdit,
      cancelEdit,
      startEdit,
      handleDeleteNewRow,
      handleDuplicateRow,
      deleteLocale,
    ]
  );

  const handlePaginationChange = useCallback((paginationUpdate) => {
    setPagination(paginationUpdate);
  }, []);

  const handleSearch = useCallback(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    fetchMessages(searchQuery);
  }, [searchQuery, fetchMessages]);

  const handleSearchChange = useCallback((event) => {
    setSearchQuery(event.target.value);
  }, []);

  return (
    <SidebarLayout
      role="admin"
      title="Localization Management"
      subtitle="Manage locale messages for all languages"
    >
      <div className="flex flex-col flex-1 min-h-0 p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex-shrink-0">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
        <div className="flex">
          {!loading && (
            <>
              <Input
                type="text"
                placeholder="Search locale messages..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
              <Button onClick={handleSearch} className="flex items-center gap-2" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>Search</span>}
              </Button>
            </>
          )}
        </div>
        <div className="flex mb-4"></div>
        {!loading && (
          <div className="flex-1 min-h-0 overflow-hidden">
            <DataTable
              columns={columns}
              data={allData}
              pageIndex={pagination.pageIndex}
              pageSize={pagination.pageSize}
              pageCount={pageCount}
              totalItems={totalItems}
              onPaginationChange={handlePaginationChange}
              canAddRows={true}
              onAddRow={handleAddRow}
              addRowText="Add New Locale Message"
            />
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}
