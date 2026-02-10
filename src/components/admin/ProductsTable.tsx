'use client';

import { useState } from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, ArrowUpDown, ChevronDown, Filter } from 'lucide-react';
import { Product } from '@/types';
import { deleteProduct } from '@/app/admin/actions';
import { useRouter } from 'next/navigation';

// Extend Product type locally to include category name
type ProductWithCategory = Product & { category?: string };

export const columns: ColumnDef<ProductWithCategory>[] = [
  {
    accessorKey: 'name_en',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Name (EN)
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="lowercase">{row.getValue('name_en')}</div>,
    filterFn: (row, id, value) => {
        const name = row.getValue(id) as string;
        const sku = row.original.id; // Using ID as proxy for SKU since SKU field isn't in type
        return name.toLowerCase().includes(value.toLowerCase()) || sku.includes(value);
    }
  },
  {
    accessorKey: 'name_ar',
    header: 'Name (AR)',
    cell: ({ row }) => <div className="text-right">{row.getValue('name_ar') || '-'}</div>,
  },
  {
    accessorKey: 'category',
    header: 'Category',
    cell: ({ row }) => <div>{row.getValue('category') || 'Uncategorized'}</div>,
    filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'price',
    header: 'Price',
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('price'));
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'KWD',
      }).format(amount);
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
      accessorKey: 'stock',
      header: 'Stock Status',
      cell: ({ row }) => {
          const inStock = row.getValue('stock');
          return (
              <Badge variant={inStock ? 'default' : 'destructive'}>
                  {inStock ? 'In Stock' : 'Out of Stock'}
              </Badge>
          );
      },
      filterFn: (row, id, value) => {
          // value is array of strings: ["true"] or ["false"]
          const stockVal = String(row.getValue(id));
          return value.includes(stockVal);
      }
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const product = row.original;
      const router = useRouter();

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(product.id)}
            >
              Copy Product ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
                onClick={async () => {
                   if (confirm('Are you sure you want to delete this product?')) {
                       await deleteProduct(product.id);
                       router.refresh();
                   }
                }}
                className="text-red-600"
            >
              Delete Product
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function ProductsTable({ data }: { data: ProductWithCategory[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  // Unique categories for filter
  const uniqueCategories = Array.from(new Set(data.map(p => p.category || 'Uncategorized')));

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Input
          placeholder="Filter by name or ID..."
          value={(table.getColumn('name_en')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('name_en')?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        
        <div className="flex gap-2">
            {/* Category Filter */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="border-dashed">
                        <Filter className="mr-2 h-4 w-4" />
                        Category
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {uniqueCategories.map(cat => (
                        <DropdownMenuCheckboxItem
                            key={cat}
                            checked={(table.getColumn('category')?.getFilterValue() as string[])?.includes(cat)}
                            onCheckedChange={(checked) => {
                                const current = (table.getColumn('category')?.getFilterValue() as string[]) || [];
                                const next = checked
                                    ? [...current, cat]
                                    : current.filter((value) => value !== cat);
                                table.getColumn('category')?.setFilterValue(next.length ? next : undefined);
                            }}
                        >
                            {cat}
                        </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

             {/* Stock Filter */}
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="border-dashed">
                        <Filter className="mr-2 h-4 w-4" />
                        Status
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {['true', 'false'].map(status => (
                        <DropdownMenuCheckboxItem
                            key={status}
                             checked={(table.getColumn('stock')?.getFilterValue() as string[])?.includes(status)}
                             onCheckedChange={(checked) => {
                                 const current = (table.getColumn('stock')?.getFilterValue() as string[]) || [];
                                 const next = checked
                                     ? [...current, status]
                                     : current.filter((value) => value !== status);
                                 table.getColumn('stock')?.setFilterValue(next.length ? next : undefined);
                             }}
                        >
                            {status === 'true' ? 'In Stock' : 'Out of Stock'}
                        </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                Columns <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                    return (
                    <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                        }
                    >
                        {column.id}
                    </DropdownMenuCheckboxItem>
                    );
                })}
            </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
