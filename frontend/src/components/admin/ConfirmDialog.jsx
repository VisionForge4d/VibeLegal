import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { AlertTriangle } from 'lucide-react';

/**
 * ConfirmDialog Component
 * Reusable confirmation dialog for destructive admin actions
 * Supports optional confirmation text input for extra safety
 */
export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'destructive', // 'destructive' | 'warning' | 'default'
  requireConfirmation = false,
  confirmationText = 'DELETE',
  loading = false
}) {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (requireConfirmation && inputValue !== confirmationText) {
      setError(`Please type "${confirmationText}" to confirm`);
      return;
    }

    onConfirm();
    handleClose();
  };

  const handleClose = () => {
    setInputValue('');
    setError('');
    onClose();
  };

  const isConfirmDisabled = requireConfirmation
    ? inputValue !== confirmationText || loading
    : loading;

  const getVariantStyles = () => {
    switch (variant) {
      case 'destructive':
        return {
          iconColor: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          buttonClass: 'bg-red-600 hover:bg-red-700 text-white'
        };
      case 'warning':
        return {
          iconColor: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          buttonClass: 'bg-yellow-600 hover:bg-yellow-700 text-white'
        };
      default:
        return {
          iconColor: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          buttonClass: 'bg-blue-600 hover:bg-blue-700 text-white'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <AlertDialog open={isOpen} onOpenChange={handleClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center">
            <AlertTriangle className={`mr-2 h-5 w-5 ${styles.iconColor}`} />
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {requireConfirmation && (
          <div className="space-y-4 my-4">
            <div className={`border ${styles.borderColor} ${styles.bgColor} rounded-lg p-4`}>
              <p className="text-sm font-medium mb-2">
                This action is permanent and cannot be undone.
              </p>
              <p className="text-sm">
                Please type <span className="font-mono font-bold">{confirmationText}</span> to confirm.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmation">Confirmation</Label>
              <Input
                id="confirmation"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  setError('');
                }}
                placeholder={`Type "${confirmationText}" to confirm`}
                autoComplete="off"
                className={error ? 'border-red-500' : ''}
              />
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
            </div>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={handleClose}
            disabled={loading}
          >
            {cancelText}
          </AlertDialogCancel>
          <button
            onClick={handleConfirm}
            disabled={isConfirmDisabled}
            className={`px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${styles.buttonClass}`}
          >
            {loading ? 'Processing...' : confirmText}
          </button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/**
 * Example usage:
 *
 * <ConfirmDialog
 *   isOpen={showDeleteDialog}
 *   onClose={() => setShowDeleteDialog(false)}
 *   onConfirm={handleDeleteUser}
 *   title="Delete User Account"
 *   description="This will permanently delete the user account and all associated data including contracts, subscriptions, and payment history. This action cannot be undone."
 *   confirmText="Delete User"
 *   variant="destructive"
 *   requireConfirmation={true}
 *   confirmationText="DELETE"
 *   loading={isDeleting}
 * />
 */
