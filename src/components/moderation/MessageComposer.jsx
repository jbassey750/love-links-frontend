import React, { useState, useRef } from "react";

const MIN_CHARACTERS = 170;

const MessageComposer = ({ onSendMessage, isDisabled, isSubmitting }) => {
  const [text, setText] = useState("");

  const textareaRef = useRef(null);

  const characterCount = text.trim().length;
  const hasEnoughCharacters = characterCount >= MIN_CHARACTERS;

  const handleSend = () => {
    if (
      !text.trim() ||
      !hasEnoughCharacters ||
      isDisabled ||
      isSubmitting
    ) {
      return;
    }

    onSendMessage(text.trim());
    setText("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e) => {
    setText(e.target.value);

    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
  };

  return (
    <div className="p-3 bg-white border-top">
      {/* Character Counter */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        <small
          className={
            hasEnoughCharacters ? "text-success fw-semibold" : "text-muted"
          }
        >
          {characterCount} / {MIN_CHARACTERS} characters
        </small>

        {!hasEnoughCharacters && characterCount > 0 && (
          <small className="text-danger">
            Please type at least {MIN_CHARACTERS} characters.
          </small>
        )}

        {hasEnoughCharacters && (
          <small className="text-success">
            Minimum reached
          </small>
        )}
      </div>

      <div className="d-flex align-items-end gap-2">
        <textarea
          ref={textareaRef}
          rows="1"
          className="form-control border-0 bg-light shadow-none resize-none"
          placeholder={
            isDisabled
              ? "Input locked: Waiting for real user response..."
              : "Type your reply (minimum 170 characters)..."
          }
          disabled={isDisabled || isSubmitting}
          value={text}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          style={{
            maxHeight: "140px",
            borderRadius: "12px",
          }}
        />

        <button
          onClick={handleSend}
          disabled={
            !text.trim() ||
            !hasEnoughCharacters ||
            isDisabled ||
            isSubmitting
          }
          className="btn text-white rounded-circle d-flex align-items-center justify-content-center shadow-sm flex-shrink-0"
          style={{
            width: "44px",
            height: "44px",
            backgroundColor: "#5c1d24",
            opacity:
              !text.trim() ||
              !hasEnoughCharacters ||
              isDisabled ||
              isSubmitting
                ? 0.6
                : 1,
          }}
        >
          {isSubmitting ? (
            <span
              className="spinner-border spinner-border-sm"
              role="status"
            ></span>
          ) : (
            <i className="bi bi-send-fill fs-6"></i>
          )}
        </button>
      </div>
    </div>
  );
};

export default MessageComposer;