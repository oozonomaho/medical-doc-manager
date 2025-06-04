import React, { useState, useEffect, useRef } from 'react';

interface EditableCellProps {
  value: string;
  onChange: (value: string | null) => void;
  type?: 'text' | 'date' | 'select' | 'number';
  options?: string[];
  placeholder?: string;
  noBorder?: boolean;
  className?: string;
  multiline?: boolean;
  allowEmpty?: boolean;
}

const EditableCell: React.FC<EditableCellProps> = ({ 
  value, 
  onChange, 
  type = 'text',
  options = [],
  placeholder = '',
  noBorder = false,
  className = '',
  multiline = false,
  allowEmpty = true
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    console.log('[EditableCell] value prop (親から来る値):', value);
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  useEffect(() => setEditValue(value), [value]);

  const handleClick = () => {
    setIsEditing(true);
  };

const handleBlur = (
  e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
) => {
  console.log('[EditableCell] onBlur発火, 入力値:', e.target.value);
  const newValue = e.target.value;
  console.log('🔚 [handleBlur] 編集完了・onChange呼び出し！値:', newValue);
  setIsEditing(false);
  if (allowEmpty && !newValue) {
    console.log('⚠️ 空なので null を渡す');
    onChange(null);
  } else {
    console.log('✅ 値を onChange に渡す:', newValue);
    onChange(newValue);
  }
};


  const handleKeyDown = (e: React.KeyboardEvent) => {
    console.log('[EditableCell] onKeyDown:', e.key, '値:', editValue);
    if (e.key === 'Enter' && !multiline) {
      setIsEditing(false);
      if (allowEmpty && !editValue) {
        onChange(null);
      } else {
        onChange(editValue);
      }
    }
    if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue(value);
    }
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (allowEmpty) {
        setEditValue('');
        onChange(null);
      }
    }
  };

  const baseInputClasses = "w-full min-w-[120px] max-w-[200px] text-sm p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400";

  if (isEditing) {
    if (multiline) {
      return (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={(e) => handleBlur(e)} 
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={3}
          className={`${baseInputClasses} resize-none ${className}`}
        />
      );
    }

    if (type === 'select') {
      return (
        <select
          ref={inputRef as React.RefObject<HTMLSelectElement>}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={(e) => handleBlur(e)} 
          onKeyDown={handleKeyDown}
          className={`${baseInputClasses} appearance-none bg-white ${className}`}
        >
          {allowEmpty && <option value="">選択してください</option>}
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type={type}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={(e) => handleBlur(e)} 
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`${baseInputClasses} ${className}`}
      />
    );
  }

  return (
    <div
      onClick={handleClick}
      className={`cursor-pointer min-h-[28px] p-2 text-sm text-gray-800 w-full min-w-[120px] max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap ${
        !value && !noBorder ? 'border border-gray-200 rounded' : ''
      } hover:bg-gray-50 ${className}`}
    >
      {value || (
        <span className="text-gray-400 italic text-xs">
          {placeholder}
        </span>
      )}
    </div>
  );
};

export default EditableCell;
