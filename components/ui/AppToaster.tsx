"use client";

import { Toaster } from "sonner";

export const AppToaster: React.FC = () => {
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      duration={4000}
    />
  );
};


