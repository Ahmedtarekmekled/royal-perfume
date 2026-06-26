'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
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
import { MoreHorizontal, ArrowUpDown, ChevronDown, Filter, ImageOff, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Product } from '@/types';
import { deleteProduct } from '@/app/admin/actions';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { DataTableFacetedFilter } from '@/components/ui/data-table-faceted-filter';
import dynamic from 'next/dynamic';

const ProductForm = dynamic(() => import('./ProductForm'), {
  loading: () => <div className="p-8 text-center text-muted-foreground">Loading form...</div>,
  ssr: false,
});

// Extend Product type locally to include category and brand name
type ProductWithDetails = Product & { category?: string; brand?: string };

export function ProductsTable({ data }: { data: ProductWithDetails[] }) {
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

  const columns: ColumnDef<ProductWithDetails>[] = [
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
      accessorKey: 'brand',
      header: 'Brand',
      cell: ({ row }) => <div className="font-medium">{row.getValue('brand') || '-'}</div>,
      filterFn: (row, id, value) => {
          return value.includes(row.getValue(id));
      },
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
        accessorKey: 'is_active',
        header: 'Status',
        cell: ({ row }) => {
            const isActive = row.getValue('is_active');
            return (
                <Badge variant={isActive ? 'default' : 'secondary'}>
                    {isActive ? 'Active' : 'Inactive'}
                </Badge>
            );
        },
        filterFn: (row, id, value) => {
            const activeVal = String(row.getValue(id));
            return value.includes(activeVal);
        }
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const product = row.original;
        return <ProductActions product={product} onEdit={() => openEditSheet(product)} />;
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

  // Unique brands for filter options
  const uniqueBrands = Array.from(new Set(data.map(p => p.brand || 'No Brand')))
    .filter(Boolean)
    .map(b => ({
        label: b,
        value: b,
    }));

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
        <Input
          placeholder="Filter by name (EN) or ID..."
          value={(table.getColumn('name_en')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('name_en')?.setFilterValue(event.target.value)
          }
          className="w-full sm:max-w-sm"
        />
        
        <div className="flex flex-wrap items-center gap-2">
            {/* Category Filter using DataTableFacetedFilter */}
            {table.getColumn('category') && (
                <DataTableFacetedFilter
                    column={table.getColumn('category')}
                    title="Category"
                    options={uniqueCategories}
                />
            )}

             {/* Brand Filter */}
            {table.getColumn('brand') && (
                <DataTableFacetedFilter
                    column={table.getColumn('brand')}
                    title="Brand"
                    options={uniqueBrands}
                />
            )}

             {/* Stock Filter using DataTableFacetedFilter */}
             {table.getColumn('stock') && (
                 <DataTableFacetedFilter
                    column={table.getColumn('stock')}
                    title="Stock"
                    options={[
                        { label: 'In Stock', value: 'true' },
                        { label: 'Out of Stock', value: 'false' }
                    ]}
                 />
             )}

             {/* Active Status Filter using DataTableFacetedFilter */}
             {table.getColumn('is_active') && (
                 <DataTableFacetedFilter
                    column={table.getColumn('is_active')}
                    title="Status"
                    options={[
                        { label: 'Active', value: 'true' },
                        { label: 'Inactive', value: 'false' }
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
      <div className="flex items-center justify-between space-x-2 py-4 px-2">
        <div className="text-sm text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount() === 0 ? 1 : table.getPageCount()}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight className="h-4 w-4" />
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

function ProductActions({ product, onEdit }: { product: Product, onEdit: () => void }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this product?')) {
      startTransition(async () => {
        try {
          await deleteProduct(product.id);
          toast.success('Product deleted successfully');
          router.refresh();
        } catch (error) {
          toast.error('Failed to delete product');
        }
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0" disabled={isPending}>
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(product.id)}>
          Copy Product ID
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onEdit}>
          Edit Product
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDelete} className="text-red-600 font-medium focus:text-red-700">
          Delete Product
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
