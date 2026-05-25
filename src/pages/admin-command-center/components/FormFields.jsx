import React from 'react';
import Input from '../../../components/ui/Input';

const FormFields = ({ username, password, setUsername, setPassword }) => (
  <div className="space-y-4">
    <div className="space-y-2">
      <label htmlFor="username" className="block text-sm font-medium text-cosmic-depth">
        Username
      </label>
      <Input
        id="username"
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Enter your username"
        required
        className="w-full"
      />
    </div>

    <div className="space-y-2">
      <label htmlFor="password" className="block text-sm font-medium text-cosmic-depth">
        Password
      </label>
      <Input
        id="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter your password"
        required
        className="w-full"
      />
    </div>
  </div>
);

export default FormFields;