import { ComponentChildren } from "preact";
import { LeftBrack, RightBrack } from "./Brackets.tsx";

const Axiom = (props: { children: ComponentChildren }) => {
  return (
    <>
      \begin<LeftBrack />AxiomC<RightBrack />
      {props.children}
      \end<LeftBrack />AxiomC<RightBrack />
    </>
  );
};

export default Axiom;
