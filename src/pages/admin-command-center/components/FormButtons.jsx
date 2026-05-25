import React from 'react';
import Button from '../../../components/ui/Button';

const FormButtons = ({ loading, onCancel }) => (
  <div className="flex space-x-3">
    <Button
      type="submit"
      variant="default"
      fullWidth
      disabled={loading}
      className="bg-cosmic-depth hover:bg-cosmic-depth/90 text-white disabled:opacity-50"
    >
      {loading ? 'Authenticating...' : 'Login'}
    </Button>
    <Button
      type="button"
      variant="outline"
      fullWidth
      onClick={onCancel}
      className="border-cosmic-depth text-cosmic-depth hover:bg-cosmic-depth hover:text-white"
    >
      Cancel
    </Button>
  </div>
);

export default FormButtons;