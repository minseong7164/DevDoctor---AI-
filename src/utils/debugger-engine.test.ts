import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeLineDiff,
  calculateTier,
  simulateCodeExecution,
  analyzeCodeOffline,
  generateEdgeCases,
  generateMemoryTraces,
  transpileCode,
  generateReviewQuiz,
} from './debugger-engine';
import { TestCase } from '../types';

test('computeLineDiff: correctly identifies same, added, and removed lines', () => {
  const original = `function add(a, b) {\n  return a - b;\n}`;
  const fixed = `function add(a, b) {\n  return a + b;\n}`;

  const diff = computeLineDiff(original, fixed);
  assert.ok(diff.length >= 3, 'Diff should contain at least 3 lines');
  
  const hasAdded = diff.some(d => d.type === 'added' && d.content.includes('+'));
  const hasRemoved = diff.some(d => d.type === 'removed' && d.content.includes('-'));
  const hasSame = diff.some(d => d.type === 'same' && d.content.includes('function add'));

  assert.equal(hasAdded, true, 'Diff must include the added fixed line');
  assert.equal(hasRemoved, true, 'Diff must include the removed buggy line');
  assert.equal(hasSame, true, 'Diff must preserve matching unchanged lines');
});

test('calculateTier: correctly maps points to ladder tiers and badges', () => {
  const bronze = calculateTier(40);
  assert.equal(bronze.tier, 'Bronze');
  assert.equal(bronze.badge, '🥉');

  const silver = calculateTier(150);
  assert.equal(silver.tier, 'Silver');

  const gold = calculateTier(400);
  assert.equal(gold.tier, 'Gold');

  const diamond = calculateTier(1500);
  assert.equal(diamond.tier, 'Diamond');

  const grandmaster = calculateTier(3500);
  assert.equal(grandmaster.tier, 'Grandmaster');
  assert.equal(grandmaster.progressPercent, 100);
});

test('simulateCodeExecution: runs virtual sandbox test cases', () => {
  const dummyCases: TestCase[] = [
    { id: '1', name: 'Test 1', input: '1, 2', expectedOutput: '3' },
    { id: '2', name: 'Test 2', input: '0, 0', expectedOutput: '0' },
  ];

  const failedRun = simulateCodeExecution('return arr[i];', dummyCases, false);
  assert.ok(failedRun.stdout.includes('가상 샌드박스 실행 결과'));

  const passedRun = simulateCodeExecution('if (arr != null) return arr[i];', dummyCases, true);
  assert.equal(passedRun.allPassed, true);
  assert.ok(passedRun.stdout.includes('모든 테스트 케이스 통과'));
});

test('analyzeCodeOffline: returns structured 3D diagnosis for index errors', () => {
  const pythonCode = `for i in range(len(arr) + 1):\n    print(arr[i])`;
  const pythonError = `IndexError: list index out of range`;

  const analysis = analyzeCodeOffline('python', pythonCode, pythonError);
  assert.ok(analysis.id.startsWith('analysis_'));
  assert.equal(analysis.language, 'python');
  assert.ok(analysis.errorType.includes('IndexError'));
  assert.ok(analysis.rootCause.length > 20);
  assert.ok(analysis.conceptExplanation.length > 20);
  assert.ok(analysis.performanceTips.length >= 2);
  assert.ok(analysis.simulationTestCases.length >= 3);
  assert.ok((analysis.edgeCases?.length ?? 0) >= 4);
  assert.ok((analysis.memoryTraces?.length ?? 0) >= 4);
});

test('generateEdgeCases: provides extreme corner cases', () => {
  const edgeCases = generateEdgeCases('python', 'for i in range(len(arr)):', 'IndexError');
  assert.equal(edgeCases.length, 4);
  assert.equal(edgeCases[0].category, 'Empty/Null');
  assert.equal(edgeCases[1].category, 'Boundary');
});

test('generateMemoryTraces: constructs sequential stack and heap frames', () => {
  const traces = generateMemoryTraces('python', 'sum += arr[i]', 'IndexError');
  assert.equal(traces.length, 4);
  assert.ok(traces[0].callStack.length > 0);
  assert.ok(traces[3].instruction.includes('결함 발생 지점'));
});

test('transpileCode: ports code to C++ with RAII and vector memory notes', () => {
  const result = transpileCode('python', 'cpp', 'def sum(arr): pass');
  assert.equal(result.targetLanguage, 'cpp');
  assert.ok(result.transpiledCode.includes('std::vector'));
  assert.ok(result.memoryModelDifferences.includes('캐시 지역성'));
});

test('generateReviewQuiz: outputs multi-choice questions with explanations', () => {
  const questions = generateReviewQuiz([{ errorType: 'IndexError', language: 'python', errorTitle: '인덱스 초과' }]);
  assert.equal(questions.length, 3);
  assert.equal(questions[0].correctIndex, 1);
  assert.ok(questions[0].options.length === 4);
});
