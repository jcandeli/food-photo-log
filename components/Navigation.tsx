'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styled from 'styled-components';

const Nav = styled.nav`
  background-color: #fff;
  border-bottom: 1px solid #e0e0e0;
  padding: 1rem 2rem;
  display: flex;
  gap: 2rem;
  justify-content: center;
`;

const NavLink = styled(Link)<{ $active: boolean }>`
  color: ${(props) => (props.$active ? '#0070f3' : '#666')};
  text-decoration: none;
  font-weight: ${(props) => (props.$active ? '600' : '400')};
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f0f0f0;
  }
`;

export function Navigation() {
  const pathname = usePathname();

  return (
    <Nav>
      <NavLink href="/" $active={pathname === '/'}>
        View Photos
      </NavLink>
      <NavLink href="/upload" $active={pathname === '/upload'}>
        Upload Photo
      </NavLink>
    </Nav>
  );
}

