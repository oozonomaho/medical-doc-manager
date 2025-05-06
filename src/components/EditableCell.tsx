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
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (allowEmpty && !editValue) {
      onChange(null);
    } else {
      onChange(editValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
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
          onBlur={handleBlur}
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
          onBlur={handleBlur}
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
        onBlur={handleBlur}
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