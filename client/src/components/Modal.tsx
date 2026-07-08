import type { ReactNode } from "react";
import "./Modal.css";

interface ModalProps {
  title: string;
  children: ReactNode;
  onClose: () => void;
}

export function Modal({
  title,
  children,
  onClose,
}: ModalProps) {
  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onClick={() => {
        console.log("Backdrop Click");
        onClose();
      }}
    >
      <div
        className="modal-panel"
        role="dialog"
        aria-modal="true"
        onClick={(e) => {
          e.stopPropagation();
          console.log("Panel Click");
        }}
      >
        <div className="modal-head">
          <h2>{title}</h2>

          <button
            type="button"
            className="modal-x"
            aria-label="Close"
            onClick={() => {
              console.log("X Click");
              onClose();
            }}
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}