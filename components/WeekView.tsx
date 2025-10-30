'use client';

import { Photo, DayGroup } from '@/types/photo';
import { PhotoTile } from './PhotoTile';
import styled from 'styled-components';
import { useState } from 'react';

const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const DaySection = styled.section`
  margin-bottom: 3rem;
`;

const DayHeader = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #333;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 0.75rem;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #666;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #666;
`;

const Modal = styled.div<{ $isOpen: boolean }>`
  display: ${(props) => (props.$isOpen ? 'flex' : 'none')};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.9);
  z-index: 1000;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  cursor: pointer;
`;

const ModalImage = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
`;

const ModalContent = styled.div`
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
`;

const ModalDescription = styled.div`
  color: white;
  margin-top: 1rem;
  text-align: center;
`;

interface WeekViewProps {
  dayGroups: DayGroup[];
  isLoading: boolean;
}

export function WeekView({ dayGroups, isLoading }: WeekViewProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  if (isLoading) {
    return (
      <Container>
        <LoadingState>Loading photos...</LoadingState>
      </Container>
    );
  }

  const hasPhotos = dayGroups.some((group) => group.photos.length > 0);

  if (!hasPhotos) {
    return (
      <Container>
        <EmptyState>
          <h2>No photos yet</h2>
          <p>Upload your first food photo to get started!</p>
        </EmptyState>
      </Container>
    );
  }

  return (
    <>
      <Container>
        {dayGroups.map((group) => {
          if (group.photos.length === 0) return null;

          return (
            <DaySection key={group.date}>
              <DayHeader>
                {group.dayOfWeek} - {group.date}
              </DayHeader>
              <Grid>
                {group.photos.map((photo) => (
                  <PhotoTile
                    key={photo.url}
                    photo={photo}
                    onClick={() => setSelectedPhoto(photo)}
                  />
                ))}
              </Grid>
            </DaySection>
          );
        })}
      </Container>

      {selectedPhoto && (
        <Modal
          $isOpen={!!selectedPhoto}
          onClick={() => setSelectedPhoto(null)}
        >
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalImage src={selectedPhoto.url} alt={selectedPhoto.description || 'Food photo'} />
            {selectedPhoto.description && (
              <ModalDescription>{selectedPhoto.description}</ModalDescription>
            )}
          </ModalContent>
        </Modal>
      )}
    </>
  );
}

