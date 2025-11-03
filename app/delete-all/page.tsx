'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';

const Container = styled.div`
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 2rem;
  text-align: center;
  color: #333;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
`;

const WarningBox = styled.div`
  padding: 1.5rem;
  background-color: #fff3cd;
  color: #856404;
  border-radius: 8px;
  border: 2px solid #ffc107;
`;

const WarningTitle = styled.h2`
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
`;

const WarningText = styled.p`
  margin: 0;
  line-height: 1.6;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 600;
  color: #333;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-family: inherit;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #0070f3;
  }

  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: #dc2626;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover:not(:disabled) {
    background-color: #b91c1c;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  padding: 1rem;
  background-color: #fee;
  color: #c33;
  border-radius: 8px;
  border: 1px solid #fcc;
`;

const SuccessMessage = styled.div`
  padding: 1rem;
  background-color: #efe;
  color: #3c3;
  border-radius: 8px;
  border: 1px solid #cfc;
`;

const CONFIRMATION_PHRASE = 'DELETE ALL';

export default function DeleteAllPage() {
  const [confirmationText, setConfirmationText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const isConfirmed = confirmationText === CONFIRMATION_PHRASE;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConfirmed) {
      return;
    }

    setIsDeleting(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/photos/delete-all', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete all photos');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete all photos');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Container>
      <Title>Delete All Photos</Title>
      <Form onSubmit={handleSubmit}>
        <WarningBox>
          <WarningTitle>⚠️ Warning</WarningTitle>
          <WarningText>
            This action will permanently delete all photos from your food log.
            This cannot be undone. Please type <strong>"{CONFIRMATION_PHRASE}"</strong> in the field below to confirm.
          </WarningText>
        </WarningBox>

        <FormGroup>
          <Label htmlFor="confirmation">Type "{CONFIRMATION_PHRASE}" to confirm:</Label>
          <Input
            id="confirmation"
            type="text"
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value)}
            placeholder={CONFIRMATION_PHRASE}
            disabled={isDeleting}
            autoComplete="off"
          />
        </FormGroup>

        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>All photos deleted successfully! Redirecting...</SuccessMessage>}

        <Button type="submit" disabled={!isConfirmed || isDeleting}>
          {isDeleting ? 'Deleting...' : 'Delete All Photos'}
        </Button>
      </Form>
    </Container>
  );
}

