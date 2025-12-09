const Scanner = require('../Scanner');
const fs = require('fs');
const path = require('path');

// Mock dependencies
jest.mock('../../utils/Logger');
jest.mock('../../utils/FileUtils');
jest.mock('../Project');
jest.mock('../../utils/PersistentTempManager');

describe('Scanner', () => {
  let scanner;

  beforeEach(() => {
    jest.clearAllMocks();
    scanner = new Scanner();
  });

  afterEach(() => {
    if (scanner) {
      scanner.stop();
    }
  });

  describe('initialization', () => {
    test('should initialize with empty projects array', () => {
      expect(scanner.projects).toEqual([]);
    });

    test('should not be running initially', () => {
      expect(scanner.running).toBe(false);
    });

    test('should initialize temp manager', () => {
      expect(scanner.tempManager).toBeDefined();
    });
  });

  describe('start()', () => {
    test('should set running to true', () => {
      scanner.start();
      expect(scanner.running).toBe(true);
    });

    test('should call start even if already running', () => {
      scanner.start();
      scanner.start();
      expect(scanner.running).toBe(true);
    });
  });

  describe('stop()', () => {
    test('should set running to false', () => {
      scanner.start();
      scanner.stop();
      expect(scanner.running).toBe(false);
    });

    test('should accept preserveResults parameter', () => {
      scanner.start();
      expect(() => scanner.stop(true)).not.toThrow();
      expect(scanner.running).toBe(false);
    });

    test('should work without preserveResults parameter', () => {
      scanner.start();
      expect(() => scanner.stop()).not.toThrow();
      expect(scanner.running).toBe(false);
    });
  });

  describe('performScan()', () => {
    beforeEach(() => {
      // Mock FileUtils.getDirectories
      const { getDirectories } = require('../../utils/FileUtils');
      getDirectories.mockResolvedValue([]);
    });

    test('should handle empty directory gracefully', async () => {
      const { getDirectories } = require('../../utils/FileUtils');
      getDirectories.mockResolvedValue([]);
      
      await expect(scanner.performScan()).resolves.not.toThrow();
    });

    test('should handle scan errors without crashing', async () => {
      const { getDirectories } = require('../../utils/FileUtils');
      getDirectories.mockRejectedValue(new Error('Read error'));
      
      await expect(scanner.performScan()).resolves.not.toThrow();
    });
  });
});
