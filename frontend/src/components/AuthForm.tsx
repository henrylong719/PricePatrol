import React, { type FormEvent, type ChangeEvent } from 'react';
import { Form, Button } from 'react-bootstrap';

interface AuthFormProps {
  email: string;
  password: string;
  name?: string;
  isLoading: boolean;
  handleEmailChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handlePasswordChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleNameChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  isRegister?: boolean;
}

const AuthForm: React.FC<AuthFormProps> = ({
  email,
  password,
  name,
  isLoading,
  handleEmailChange,
  handlePasswordChange,
  handleNameChange,
  handleSubmit,
  isRegister,
}) => {
  return (
    <Form onSubmit={handleSubmit}>
      {isRegister && (
        <Form.Group className="mt-5" controlId="name">
          <Form.Control
            type="text"
            placeholder="Your name"
            value={name}
            onChange={handleNameChange}
          />
        </Form.Group>
      )}

      <Form.Group className="my-3" controlId="email">
        <Form.Control
          type="email"
          placeholder="Email address"
          value={email}
          onChange={handleEmailChange}
        />
      </Form.Group>

      <Form.Group className="my-3" controlId="password">
        <Form.Control
          type="password"
          placeholder="Password"
          value={password}
          onChange={handlePasswordChange}
        />
      </Form.Group>

      <Button
        disabled={isLoading}
        style={{ padding: '0.7rem' }}
        type="submit"
        className="w-100 mt-2"
        variant="dark"
      >
        {isRegister ? 'Sign up' : 'Sign in'}
      </Button>
    </Form>
  );
};

export default AuthForm;
