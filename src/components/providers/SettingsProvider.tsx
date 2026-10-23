'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { DEFAULT_MIN_ORDER_QUANTITY } from '@/lib/min-order';

export interface PopupSettings {
  popup_enabled: boolean;
  popup_title: string;
  popup_message: string;
  popup_button_text: string;
  popup_button_link: string;
  popup_image_url: string;
  popup_show_on: string; // 'all' | 'shop' | 'home'
}

interface SettingsContextType {
  hidePrices: boolean;
  popupSettings: PopupSettings | null;
  minOrderQuantity: number;
}

const SettingsContext = createContext<SettingsContextType>({
  hidePrices: false,
  popupSettings: null,
  minOrderQuantity: DEFAULT_MIN_ORDER_QUANTITY,
});

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({
  children,
  hidePrices,
  popupSettings = null,
  minOrderQuantity = DEFAULT_MIN_ORDER_QUANTITY,
}: {
  children: ReactNode;
  hidePrices: boolean;
  popupSettings?: PopupSettings | null;
  minOrderQuantity?: number;
}) => {
  return (
    <SettingsContext.Provider value={{ hidePrices, popupSettings, minOrderQuantity }}>
      {children}
    </SettingsContext.Provider>
  );
};
