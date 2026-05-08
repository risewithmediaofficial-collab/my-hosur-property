import styled, { keyframes } from "styled-components";

const bounce = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-12px);
  }
`;

const LoaderContainer = styled.div`
  min-height: 320px;
  display: grid;
  place-items: center;
  padding: 4rem 1rem;
  color: #202020;
  background: transparent;
`;

const LoadingBounce = styled.div`
  width: ${(props) => props.size}px;
  height: ${(props) => props.size}px;
  border-radius: 50%;
  border: 6px solid rgba(16, 185, 129, 0.3);
  border-top-color: #16a34a;
  animation: ${bounce} 1.2s ease-in-out infinite;
`;

const LoaderText = styled.div`
  margin-top: 1rem;
  font-size: 0.95rem;
  color: rgba(28, 28, 30, 0.9);
  letter-spacing: 0.03em;
  text-transform: uppercase;
  font-weight: 700;
`;

const Loader = ({ text = "Loading...", size = 48 }) => (
  <LoaderContainer>
    <div className="flex flex-col items-center gap-4">
      <LoadingBounce size={size} />
      <LoaderText>{text}</LoaderText>
    </div>
  </LoaderContainer>
);

export default Loader;
