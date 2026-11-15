import React from 'react';

interface LanguageSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Language select popup removed per user request:
 * "remove the select language popup"
 */
export const LanguageSelectModal: React.FC<LanguageSelectModalProps> = () => null;

export default LanguageSelectModal;
