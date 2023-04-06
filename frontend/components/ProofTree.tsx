import { ComponentChildren } from "preact";

const ProofTree = ({ children }: { children: ComponentChildren }) => {
  return (
    <div>
      $$ \begin&#123;prooftree&#125;
      {children}
      \end&#123;prooftree&#125; $$
    </div>
  );
};
const Axiom = (props: { children: ComponentChildren }) => {
  return (
    <>
      \AxiomC&#123;
      {props.children}
      &#125;
    </>
  );
};
const UnaryInf = (props: { children: ComponentChildren }) => {
  return (
    <>
      \UnaryInfC&#123;
      {props.children}
      &#125;
    </>
  );
};
const BinaryInf = (props: { children: ComponentChildren }) => {
  return (
    <>
      \BinaryInf&#123;
      {props.children}
      &#125;
    </>
  );
};

export { Axiom, ProofTree, UnaryInf };
