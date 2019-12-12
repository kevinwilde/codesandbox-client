import styled from 'styled-components';

export const Container = styled.div`
  min-width: 870px;
  max-width: 1200px;
  height: 496px;
  overflow: hidden;
  border: 1px solid #242424;
  border-radius: 4px;
  background-color: #242424;
  color: #fff;

  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.24);
`;

export const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 1rem;
  margin: 1.5rem 1.5rem 0 1.5rem;
  border-bottom: 1px solid #242424;
  font-size: 19px;
  line-height: 24px;
`;

export const SubHeader = styled.h2`
  font-family: Inter;
  font-style: normal;
  font-weight: normal;
  font-size: 16px;
  line-height: 19px;
  margin: 1rem 1.5rem;
  margin-top: 24px;
`;

export const Grid = styled.div<{ columnCount: number }>`
  display: grid;
  margin: 0 1.5rem;
  grid-template-columns: repeat(${props => props.columnCount}, 1fr);
  gap: 1rem;
`;
