import styled, { keyframes } from "styled-components";

const rotate = keyframes`
  100% {
    transform: rotate(360deg);
  }
`;

const dash = keyframes`
  0% {
    stroke-dasharray: 1, 200;
    stroke-dashoffset: 0;
  }

  50% {
    stroke-dasharray: 90, 200;
    stroke-dashoffset: -35px;
  }

  100% {
    stroke-dashoffset: -125px;
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

const Spinner = styled.svg`
  width: ${(props) => props.size}px;
  height: ${(props) => props.size}px;
  transform-origin: center;
  animation: ${rotate} 2s linear infinite;

  circle {
    fill: none;
    stroke: hsl(214, 97%, 59%);
    stroke-width: 2;
    stroke-dasharray: 1, 200;
    stroke-dashoffset: 0;
    stroke-linecap: round;
    animation: ${dash} 1.5s ease-in-out infinite;
  }
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
      <Spinner size={size} viewBox="25 25 50 50" role="status" aria-label={text}>
        <circle r={20} cy={50} cx={50} />
      </Spinner>
      <LoaderText>{text}</LoaderText>
    </div>
  </LoaderContainer>
);

export default Loader;
