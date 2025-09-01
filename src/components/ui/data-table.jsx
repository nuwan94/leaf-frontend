import * as React from 'react';
import { useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Plus,
} from 'lucide-react';

export function DataTable({
  columns,
  data,
  pageIndex = 0,
  pageSize = 10,
  pageCount = 1,
  totalItems = 0,
  onPaginationChange,
  canAddRows = false,
  onAddRow,
  addRowText = "Add New Row",
}) {
  const handlePageSizeChange = useCallback((newSize) => {
    const newPageSize = Number(newSize);
    if (onPaginationChange) {
      onPaginationChange({
        pageIndex: 0, // Reset to first page when changing page size
        pageSize: newPageSize,
      });
    }
  }, [onPaginationChange]);

  const handlePageChange = useCallback((newPageIndex) => {
    if (onPaginationChange) {
      onPaginationChange({
        pageIndex: newPageIndex,
        pageSize,
      });
    }
  }, [onPaginationChange, pageSize]);

  const canPreviousPage = pageIndex > 0;
  const canNextPage = pageIndex < pageCount - 1;

  return (
    <div className="w-full h-full max-h-full flex flex-col min-h-0 gap-4">
      {/* Action buttons */}
      {canAddRows && (
        <div className="flex justify-start flex-shrink-0">
          <Button onClick={onAddRow} size="sm" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span>{addRowText}</span>
          </Button>
        </div>
      )}

      {/* Table Container with horizontal scroll on small screens */}
  <div className="w-full flex-1 min-h-0 border rounded-md flex flex-col overflow-hidden max-h-[70vh]">
        <div className="w-full overflow-x-auto">
          <Table className="w-full min-w-[700px]">
            {/* Fixed Header */}
            <TableHeader className="bg-background sticky top-0 z-10">
              <TableRow>
                {columns.map((column, index) => (
                  <TableHead
                    key={column.id || column.accessorKey || index}
                    className="font-medium border-b bg-muted/50"
                    style={column.width ? { width: column.width, minWidth: column.width, maxWidth: column.width } : {}}
                  >
                    {column.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
          </Table>
        </div>
        {/* Scrollable Table Body, always matches table width */}
  <div className="flex-1 overflow-y-auto w-full">
          <div className="w-full overflow-x-auto">
            <Table className="w-full min-w-[700px]">
              <TableBody>
                {data && data.length > 0 ? (
                  data.map((row, rowIndex) => (
                    <TableRow key={row._tempId || rowIndex} className="border-b">
                      {columns.map((column, colIndex) => (
                        <TableCell
                          key={`${rowIndex}-${colIndex}`}
                          className="p-4"
                          style={column.width ? { width: column.width, minWidth: column.width, maxWidth: column.width } : {}}
                        >
                          {column.cell
                            ? column.cell({ row: { original: row, index: rowIndex } })
                            : row[column.accessorKey]
                          }
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                      No results found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between px-2 flex-shrink-0">
        <div className="flex-1 text-sm text-muted-foreground">
          {totalItems > 0 ? (
            <>
              Showing {pageIndex * pageSize + 1}
              –{Math.min((pageIndex + 1) * pageSize, totalItems)} of {totalItems} total entries
            </>
          ) : (
            <>No entries found</>
          )}
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <Select
              value={`${pageSize}`}
              onValueChange={handlePageSizeChange}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((size) => (
                  <SelectItem key={size} value={`${size}`}>{size}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => handlePageChange(0)}
              disabled={!canPreviousPage}
            >
              <span className="sr-only">Go to first page</span>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => handlePageChange(pageIndex - 1)}
              disabled={!canPreviousPage}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {/* Page number buttons */}
            {Array.from({ length: pageCount }, (_, i) => (
              <Button
                key={i}
                variant={i === pageIndex ? "default" : "outline"}
                className="h-8 w-8 p-0"
                onClick={() => handlePageChange(i)}
                disabled={i === pageIndex}
              >
                {i + 1}
              </Button>
            ))}
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => handlePageChange(pageIndex + 1)}
              disabled={!canNextPage}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => handlePageChange(pageCount - 1)}
              disabled={!canNextPage}
            >
              <span className="sr-only">Go to last page</span>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
