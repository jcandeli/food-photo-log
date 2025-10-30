'use client';

import { UploadForm } from '@/components/UploadForm';
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

export default function UploadPage() {
  return (
    <Container>
      <Title>Upload Food Photo</Title>
      <UploadForm />
    </Container>
  );
}

