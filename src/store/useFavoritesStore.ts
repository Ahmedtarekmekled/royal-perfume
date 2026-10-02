import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface FavoriteItem {
    id: string;
    name: string;
    price: number;
    image: string;
    slug?: string | null;
}

interface FavoritesState {
    items: FavoriteItem[];
    isFavorite: (productId: string) => boolean;
    addFavorite: (item: FavoriteItem) => void;
    removeFavorite: (productId: string) => void;
    toggleFavorite: (item: FavoriteItem) => void;
    getCount: () => number;
}

export const useFavoritesStore = create<FavoritesState>()(
    persist(
        (set, get) => ({
            items: [],
            isFavorite: (productId) => get().items.some((item) => item.id === productId),
            addFavorite: (item) => set((state) => {
                if (state.items.some((i) => i.id === item.id)) return state;
                return { items: [...state.items, item] };
            }),
            removeFavorite: (productId) => set((state) => ({
                items: state.items.filter((item) => item.id !== productId)
            })),
            toggleFavorite: (item) => set((state) => {
                const exists = state.items.some((i) => i.id === item.id);
                return {
                    items: exists
                        ? state.items.filter((i) => i.id !== item.id)
                        : [...state.items, item]
                };
            }),
            getCount: () => get().items.length,
        }),
        {
            name: 'favorites-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
