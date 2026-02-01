/**
 * [INPUT]: 依赖 @/types, react hooks
 * [OUTPUT]: 对外提供 QuestionPanel 问题选择面板组件
 * [POS]: components 的交互组件, 渲染 AskUserQuestion 的选项界面
 * [PROTOCOL]: 变更时更新此头部, 然后检查 CLAUDE.md
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Question, Answers, AnswerValue } from '@/types';

interface Props {
  questions: Question[];
  onSubmit: (answers: Answers) => void;
}

export default function QuestionPanel({ questions, onSubmit }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [focusedOption, setFocusedOption] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const otherInputRef = useRef<HTMLInputElement>(null);

  const currentQuestion = questions[currentIndex];
  const totalOptions = currentQuestion.options.length + 1; // +1 for "Other"
  const answerKey = `question_${currentIndex}`;
  const currentAnswer = answers[answerKey];

  /* ========== check if question is answered ========== */
  const isAnswered = (index: number): boolean => {
    const key = `question_${index}`;
    const value = answers[key];
    if (value === undefined) return false;
    if (Array.isArray(value)) return value.length > 0;
    return value !== '';
  };

  const allAnswered = questions.every((_, i) => isAnswered(i));

  /* ========== option selection logic ========== */
  const selectOption = useCallback((optionIndex: number) => {
    const optionLabel = currentQuestion.options[optionIndex].label;

    if (currentQuestion.multiSelect) {
      const current = (currentAnswer as string[] | undefined) || [];
      const filtered = current.filter(v => !v.startsWith('Other: '));
      const idx = filtered.indexOf(optionLabel);

      if (idx > -1) {
        filtered.splice(idx, 1);
      } else {
        filtered.push(optionLabel);
      }

      setAnswers(prev => ({
        ...prev,
        [answerKey]: filtered.length > 0 ? filtered : undefined,
      }));
    } else {
      setAnswers(prev => ({
        ...prev,
        [answerKey]: optionLabel,
      }));
    }
  }, [currentQuestion, currentAnswer, answerKey]);

  const selectOther = useCallback(() => {
    const otherText = otherInputRef.current?.value || '';

    if (currentQuestion.multiSelect) {
      const current = (currentAnswer as string[] | undefined) || [];
      const hasOther = current.some(v => v.startsWith('Other: '));

      if (hasOther) {
        setAnswers(prev => ({
          ...prev,
          [answerKey]: current.filter(v => !v.startsWith('Other: ')),
        }));
      } else {
        setAnswers(prev => ({
          ...prev,
          [answerKey]: [...current.filter(v => !v.startsWith('Other: ')), `Other: ${otherText}`],
        }));
      }
    } else {
      setAnswers(prev => ({
        ...prev,
        [answerKey]: `Other: ${otherText}`,
      }));
    }

    setTimeout(() => otherInputRef.current?.focus(), 0);
  }, [currentQuestion, currentAnswer, answerKey]);

  const updateOtherValue = useCallback((text: string) => {
    if (currentQuestion.multiSelect) {
      const current = (currentAnswer as string[] | undefined) || [];
      const filtered = current.filter(v => !v.startsWith('Other: '));
      if (text) {
        filtered.push(`Other: ${text}`);
      }
      setAnswers(prev => ({
        ...prev,
        [answerKey]: filtered.length > 0 ? filtered : undefined,
      }));
    } else {
      setAnswers(prev => ({
        ...prev,
        [answerKey]: `Other: ${text}`,
      }));
    }
  }, [currentQuestion, currentAnswer, answerKey]);

  /* ========== check if option is selected ========== */
  const isSelected = (optionLabel: string): boolean => {
    if (currentQuestion.multiSelect) {
      return Array.isArray(currentAnswer) && currentAnswer.includes(optionLabel);
    }
    return currentAnswer === optionLabel;
  };

  const isOtherSelected = (): boolean => {
    if (currentQuestion.multiSelect) {
      return Array.isArray(currentAnswer) && currentAnswer.some(v => v.startsWith('Other: '));
    }
    return typeof currentAnswer === 'string' && currentAnswer.startsWith('Other: ');
  };

  const getOtherValue = (): string => {
    if (currentQuestion.multiSelect) {
      const found = (currentAnswer as string[] | undefined)?.find(v => v.startsWith('Other: '));
      return found ? found.replace('Other: ', '') : '';
    }
    return typeof currentAnswer === 'string' && currentAnswer.startsWith('Other: ')
      ? currentAnswer.replace('Other: ', '')
      : '';
  };

  /* ========== keyboard navigation ========== */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement && e.target.classList.contains('other-input')) {
        if (e.key === 'Escape') {
          e.target.blur();
        }
        return;
      }

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          setFocusedOption(prev => (prev - 1 + totalOptions) % totalOptions);
          break;

        case 'ArrowDown':
          e.preventDefault();
          setFocusedOption(prev => (prev + 1) % totalOptions);
          break;

        case 'ArrowLeft':
          e.preventDefault();
          if (questions.length > 1) {
            setCurrentIndex(prev => (prev - 1 + questions.length) % questions.length);
            setFocusedOption(0);
          }
          break;

        case 'ArrowRight':
          e.preventDefault();
          if (questions.length > 1) {
            setCurrentIndex(prev => (prev + 1) % questions.length);
            setFocusedOption(0);
          }
          break;

        case ' ':
          e.preventDefault();
          if (focusedOption < currentQuestion.options.length) {
            selectOption(focusedOption);
          } else {
            selectOther();
          }
          break;

        case 'Enter':
          e.preventDefault();
          if (allAnswered) {
            handleSubmit();
          } else if (focusedOption < currentQuestion.options.length) {
            selectOption(focusedOption);
          } else {
            selectOther();
          }
          break;

        case 'Tab':
          e.preventDefault();
          if (allAnswered) {
            handleSubmit();
          } else {
            for (let i = 0; i < questions.length; i++) {
              const nextIndex = (currentIndex + 1 + i) % questions.length;
              if (!isAnswered(nextIndex)) {
                setCurrentIndex(nextIndex);
                setFocusedOption(0);
                break;
              }
            }
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [questions, currentIndex, focusedOption, totalOptions, allAnswered, selectOption, selectOther]);

  /* ========== submit handler ========== */
  const handleSubmit = () => {
    if (!allAnswered) return;

    const result: Answers = {};
    Object.entries(answers).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        result[key] = value.map(v => v.startsWith('Other: ') ? v.replace('Other: ', '') : v);
      } else if (typeof value === 'string' && value.startsWith('Other: ')) {
        result[key] = value.replace('Other: ', '');
      } else if (value !== undefined) {
        result[key] = value;
      }
    });

    onSubmit(result);
  };

  return (
    <div className="question-panel">
      {/* ========== title bar ========== */}
      <div className="question-panel-header">
        <span className="question-panel-title">AI Questions</span>
        <span className="question-panel-hint">
          Use arrow keys to navigate
        </span>
      </div>

      {/* ========== tabs ========== */}
      <div className="question-tabs">
        {questions.map((q, index) => (
          <button
            key={index}
            className={`question-tab ${index === currentIndex ? 'active' : ''} ${isAnswered(index) ? 'answered' : ''}`}
            onClick={() => {
              setCurrentIndex(index);
              setFocusedOption(0);
            }}
          >
            {q.header}
          </button>
        ))}
        <button
          className="question-tab submit-tab"
          disabled={!allAnswered}
          onClick={handleSubmit}
        >
          Submit
        </button>
      </div>

      {/* ========== question content ========== */}
      <div className="question-content">
        <p className="question-text">{currentQuestion.question}</p>

        <div className="options-list">
          {currentQuestion.options.map((opt, optIndex) => (
            <div
              key={optIndex}
              className={`option-item ${isSelected(opt.label) ? 'selected' : ''} ${focusedOption === optIndex ? 'focused' : ''}`}
              onClick={() => selectOption(optIndex)}
            >
              <input
                type={currentQuestion.multiSelect ? 'checkbox' : 'radio'}
                checked={isSelected(opt.label)}
                readOnly
              />
              <div className="option-content">
                <div className="option-label">{opt.label}</div>
                <div className="option-desc">{opt.description}</div>
              </div>
            </div>
          ))}

          {/* Other option */}
          <div
            className={`option-item ${isOtherSelected() ? 'selected' : ''} ${focusedOption === currentQuestion.options.length ? 'focused' : ''}`}
            onClick={selectOther}
          >
            <input
              type={currentQuestion.multiSelect ? 'checkbox' : 'radio'}
              checked={isOtherSelected()}
              readOnly
            />
            <div className="option-content">
              <div className="option-label">Other</div>
              <div className="option-desc">Type your own answer</div>
              <input
                ref={otherInputRef}
                type="text"
                className={`other-input ${isOtherSelected() ? 'visible' : ''}`}
                placeholder="Type your answer..."
                value={getOtherValue()}
                onChange={e => updateOtherValue(e.target.value)}
                onClick={e => e.stopPropagation()}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ========== keyboard hint ========== */}
      <div className="keyboard-hint">
        <kbd>Up</kbd>/<kbd>Down</kbd> options |{' '}
        <kbd>Left</kbd>/<kbd>Right</kbd> questions |{' '}
        <kbd>Space</kbd> select |{' '}
        <kbd>Enter</kbd> submit
      </div>
    </div>
  );
}
