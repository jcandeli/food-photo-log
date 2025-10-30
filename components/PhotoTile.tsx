"use client";

import Image from "next/image";
import styled from "styled-components";

const Tile = styled.div`
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  background-color: #f0f0f0;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;

  &:hover {
    transform: scale(1.02);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Overlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  padding: 1rem;
  color: white;
  font-size: 0.875rem;
`;

interface PhotoTileProps {
  photo: {
    url: string;
    description?: string;
  };
  onClick?: () => void;
}

export function PhotoTile({ photo, onClick }: PhotoTileProps) {
  return (
    <Tile onClick={onClick}>
      <ImageContainer>
        <Image
          src={photo.url}
          alt={photo.description || "Food photo"}
          width={400}
          height={300}
          style={{
            objectFit: "contain",
            width: "100%",
            height: "auto",
            maxHeight: "400px",
          }}
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
        />
        {photo.description && (
          <Overlay>
            <div>{photo.description}</div>
          </Overlay>
        )}
      </ImageContainer>
    </Tile>
  );
}
