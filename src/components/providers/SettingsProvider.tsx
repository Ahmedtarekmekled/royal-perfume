'use client';

import React, { createContext, useContext, ReactNode } from 'react';

interface SettingsContextType {
  hidePrices: boolean;
}

const SettingsContext = createContext<SettingsContextType>({ hidePrices: false });

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({
  children,
  hidePrices,
}: {
  children: ReactNode;
  hidePrices: boolean;
}) => {
  return (
    <SettingsContext.Provider value={{ hidePrices }}>
      {children}
    </SettingsContext.Provider>
  );
};
