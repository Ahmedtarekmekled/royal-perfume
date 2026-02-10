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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, ArrowUpDown, ChevronDown, Filter, ImageOff } from 'lucide-react';
import { Product } from '@/types';
import { deleteProduct } from '@/app/admin/actions';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { DataTableFacetedFilter } from '@/components/ui/data-table-faceted-filter';
import ProductForm from './ProductForm';

// Extend Product type locally to include category name
type ProductWithCategory = Product & { category?: string };

export function ProductsTable({ data }: { data: ProductWithCategory[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  
  // Edit State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);

  const openEditSheet = (product: Product) => {
    setEditingProduct(product);
    setIsEditSheetOpen(true);
  };

  const columns: ColumnDef<ProductWithCategory>[] = [
    {
        id: 'image',
        header: 'Image',
        cell: ({ row }) => {
            const images = row.original.images;
            const mainImage = images && images.length > 0 ? images[0] : null;

            return (
                <div className="h-10 w-10 relative rounded overflow-hidden border bg-gray-50 flex items-center justify-center">
                    {mainImage ? (
                        <Image 
                            src={mainImage} 
                            alt={row.original.name_en} 
                            fill 
                            className="object-cover" 
                            sizes="40px"
                        />
                    ) : (
                        <ImageOff className="h-4 w-4 text-gray-400" />
                    )}
                </div>
            )
        }
    },
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
      cell: ({ row }) => <div className="lowercase font-medium">{row.getValue('name_en')}</div>,
      filterFn: (row, id, value) => {
          const name = row.getValue(id) as string;
          const sku = row.original.id; // Using ID as proxy for SKU since SKU field isn't in type
          return name.toLowerCase().includes(value.toLowerCase()) || sku.includes(value);
      }
    },
    {
      accessorKey: 'name_ar',
      header: 'Name (AR)',
      cell: ({ row }) => <div className="text-right font-arabic">{row.getValue('name_ar') || '-'}</div>,
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
              <DropdownMenuItem onClick={() => openEditSheet(product)}>
                Edit Product
              </DropdownMenuItem>
              <DropdownMenuItem
                  onClick={async () => {
                     if (confirm('Are you sure you want to delete this product?')) {
                         await deleteProduct(product.id);
                         router.refresh();
                     }
                  }}
                  className="text-red-600 font-medium focus:text-red-700"
              >
                Delete Product
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

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

  // Unique categories for filter options
  const uniqueCategories = Array.from(new Set(data.map(p => p.category || 'Uncategorized')))
    .filter(Boolean)
    .map(cat => ({
        label: cat,
        value: cat,
    }));

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Input
          placeholder="Filter by name (EN) or ID..."
          value={(table.getColumn('name_en')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('name_en')?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        
        <div className="flex gap-2">
            {/* Category Filter using DataTableFacetedFilter */}
            {table.getColumn('category') && (
                <DataTableFacetedFilter
                    column={table.getColumn('category')}
                    title="Category"
                    options={uniqueCategories}
                />
            )}

             {/* Stock Filter using DataTableFacetedFilter */}
             {table.getColumn('stock') && (
                 <DataTableFacetedFilter
                    column={table.getColumn('stock')}
                    title="Status"
                    options={[
                        { label: 'In Stock', value: 'true' },
                        { label: 'Out of Stock', value: 'false' }
                    ]}
                 />
             )}

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
      <div className="rounded-md border bg-white">
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

      {/* Edit Sheet */}
      <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
        <SheetContent className="sm:max-w-2xl overflow-y-auto w-full">
            <SheetHeader>
                <SheetTitle>Edit Product</SheetTitle>
                <SheetDescription>
                    Make changes to your product here. Click save when you're done.
                </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
                {editingProduct && (
                    <ProductForm 
                        initialData={editingProduct} 
                        onSuccess={() => setIsEditSheetOpen(false)}
                    />
                )}
            </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
