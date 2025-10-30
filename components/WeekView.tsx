'use client';

import { Photo, DayGroup } from '@/types/photo';
import { PhotoTile } from './PhotoTile';
import styled from 'styled-components';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

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

const DeleteButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background-color: rgba(220, 38, 38, 0.9);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  z-index: 1001;

  &:hover {
    background-color: rgba(185, 28, 28, 0.95);
  }

  &:active {
    background-color: rgba(153, 27, 27, 1);
  }
`;

const ConfirmDialog = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(255, 255, 255, 0.95);
  padding: 2rem;
  border-radius: 12px;
  z-index: 1002;
  max-width: 400px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
`;

const ConfirmTitle = styled.h3`
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.25rem;
`;

const ConfirmMessage = styled.p`
  margin: 0 0 1.5rem 0;
  color: #666;
  line-height: 1.5;
`;

const ConfirmButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
`;

const ConfirmButton = styled.button<{ $danger?: boolean }>`
  padding: 0.5rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;

  ${(props) =>
    props.$danger
      ? `
    background-color: #dc2626;
    color: white;
    &:hover {
      background-color: #b91c1c;
    }
  `
      : `
    background-color: #e5e7eb;
    color: #333;
    &:hover {
      background-color: #d1d5db;
    }
  `}
`;

interface WeekViewProps {
  dayGroups: DayGroup[];
  isLoading: boolean;
  onRefresh?: () => void;
}

export function WeekView({ dayGroups, isLoading, onRefresh }: WeekViewProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

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
          onClick={() => {
            if (!showDeleteConfirm) {
              setSelectedPhoto(null);
              setShowDeleteConfirm(false);
            }
          }}
        >
          <ModalContent onClick={(e) => e.stopPropagation()}>
            {!showDeleteConfirm ? (
              <>
                <DeleteButton
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteConfirm(true);
                  }}
                  disabled={isDeleting}
                >
                  Delete
                </DeleteButton>
                <ModalImage src={selectedPhoto.url} alt={selectedPhoto.description || 'Food photo'} />
                {selectedPhoto.description && (
                  <ModalDescription>{selectedPhoto.description}</ModalDescription>
                )}
              </>
            ) : (
              <ConfirmDialog onClick={(e) => e.stopPropagation()}>
                <ConfirmTitle>Delete Photo?</ConfirmTitle>
                <ConfirmMessage>
                  Are you sure you want to delete this photo? This action cannot be undone.
                </ConfirmMessage>
                <ConfirmButtons>
                  <ConfirmButton
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteConfirm(false);
                    }}
                    disabled={isDeleting}
                  >
                    Cancel
                  </ConfirmButton>
                  <ConfirmButton
                    $danger
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (!selectedPhoto) return;

                      setIsDeleting(true);
                      try {
                        const response = await fetch(
                          `/api/photos?url=${encodeURIComponent(selectedPhoto.url)}`,
                          {
                            method: 'DELETE',
                          }
                        );

                        if (response.ok) {
                          setSelectedPhoto(null);
                          setShowDeleteConfirm(false);
                          // Refresh the page to update the photo list
                          router.refresh();
                          if (onRefresh) {
                            onRefresh();
                          }
                        } else {
                          alert('Failed to delete photo. Please try again.');
                        }
                      } catch (error) {
                        console.error('Delete error:', error);
                        alert('Failed to delete photo. Please try again.');
                      } finally {
                        setIsDeleting(false);
                      }
                    }}
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </ConfirmButton>
                </ConfirmButtons>
              </ConfirmDialog>
            )}
          </ModalContent>
        </Modal>
      )}
    </>
  );
}

