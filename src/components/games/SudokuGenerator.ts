// 数独生成器模块
export class SudokuGenerator {
  // 生成一个完整的数独终盘
  public generateCompleteBoard(): number[][] {
    // 创建空的9x9棋盘
    const board: number[][] = Array(9).fill(0).map(() => Array(9).fill(0));
    
    // 使用回溯算法填充棋盘
    this.solveSudoku(board);
    
    return board;
  }
  
  // 生成指定难度的数独题目
  public generatePuzzle(difficulty: 'easy' | 'medium' | 'hard'): number[][] {
    // 先生成一个完整的终盘
    const completeBoard = this.generateCompleteBoard();
    
    // 根据难度确定挖去的数字数量
    let cellsToRemove: number;
    switch (difficulty) {
      case 'easy':
        cellsToRemove = 40; // 移除40个数字
        break;
      case 'medium':
        cellsToRemove = 50; // 移除50个数字
        break;
      case 'hard':
        cellsToRemove = 60; // 移除60个数字
        break;
      default:
        cellsToRemove = 40;
    }
    
    // 复制完整棋盘
    const puzzle: number[][] = JSON.parse(JSON.stringify(completeBoard));
    
    // 挖洞生成题目
    this.digHoles(puzzle, cellsToRemove);
    
    return puzzle;
  }
  
  // 数独求解器（回溯算法）
  private solveSudoku(board: number[][]): boolean {
    // 寻找空格子
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row]?.[col] === 0) {
          // 尝试填入1-9
          const numbers = this.shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
          for (const num of numbers) {
            if (this.isValidPlacement(board, row, col, num)) {
              // @ts-expect-error 确保访问是安全的 - board[row]已通过循环验证存在
              board[row][col] = num;
              
              // 递归求解
              if (this.solveSudoku(board)) {
                return true;
              }
              
              // 回溯
              // @ts-expect-error 确保访问是安全的 - board[row]已通过循环验证存在
              board[row][col] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  }
  
  // 检查在指定位置放置数字是否有效
  private isValidPlacement(board: number[][], row: number, col: number, num: number): boolean {
    // 检查行
    for (let i = 0; i < 9; i++) {
      if (board[row]?.[i] === num) {
        return false;
      }
    }
    
    // 检查列
    for (let i = 0; i < 9; i++) {
      if (board[i]?.[col] === num) {
        return false;
      }
    }
    
    // 检查3x3宫格
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[startRow + i]?.[startCol + j] === num) {
          return false;
        }
      }
    }
    
    return true;
  }
  
  // 挖洞算法
  private digHoles(board: number[][], cellsToRemove: number): void {
    // 创建所有位置的数组
    const positions: [number, number][] = [];
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        positions.push([row, col]);
      }
    }
    
    // 随机打乱位置
    this.shuffleArray(positions);
    
    let removedCount = 0;
    for (const [row, col] of positions) {
      if (removedCount >= cellsToRemove) {
        break;
      }
      
      // 检查数组访问安全性
      if (!board[row] || board[row][col] === undefined) {
        continue;
      }
      
      // 保存当前值
      const oldValue = board[row][col];
      
      // 挖掉这个数字
      board[row][col] = 0;
      
      // 检查是否仍有唯一解
      if (this.hasUniqueSolution(JSON.parse(JSON.stringify(board)))) {
        removedCount++;
      } else {
        // 如果不唯一，恢复原值
        board[row][col] = oldValue;
      }
    }
  }
  
  // 检查题目是否有唯一解
  private hasUniqueSolution(board: number[][]): boolean {
    return this.countSolutions(JSON.parse(JSON.stringify(board))) === 1;
  }
  
  // 计算题目解的数量（最多计算到2）
  private countSolutions(board: number[][], limit: number = 2): number {
    // 寻找空格子
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row]?.[col] === 0) {
          let count = 0;
          // 尝试填入1-9
          for (let num = 1; num <= 9; num++) {
            if (this.isValidPlacement(board, row, col, num)) {
              // @ts-expect-error 确保访问是安全的 - board[row]已通过循环验证存在
              board[row][col] = num;
              
              // 递归计算解的数量
              count += this.countSolutions(board, limit);
              
              // 如果已经超过了限制，直接返回
              if (count >= limit) {
                return count;
              }
              
              // 回溯
              // @ts-expect-error 确保访问是安全的 - board[row]已通过循环验证存在
              board[row][col] = 0;
            }
          }
          return count;
        }
      }
    }
    // 没有空格子，说明找到了一个解
    return 1;
  }
  
  // 随机打乱数组
  private shuffleArray<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      // 使用类型断言确保交换的安全性
      [result[i], result[j]] = [result[j] as T, result[i] as T];
    }
    return result;
  }
}

// 预生成的数独题目库
export class SudokuPuzzleBank {
  private generator: SudokuGenerator;
  private puzzles: Map<string, number[][][]>;
  private maxPuzzlesPerDifficulty: number;
  
  constructor(maxPuzzlesPerDifficulty: number = 5) {
    this.generator = new SudokuGenerator();
    this.puzzles = new Map();
    this.maxPuzzlesPerDifficulty = maxPuzzlesPerDifficulty;
    
    // 初始化每个难度的题目数组
    this.puzzles.set('easy', []);
    this.puzzles.set('medium', []);
    this.puzzles.set('hard', []);
  }
  
  // 预生成题目
  public preGeneratePuzzles(): void {
    console.log('开始预生成数独题目...');
    
    // 为每个难度生成指定数量的题目
    const difficulties: ('easy' | 'medium' | 'hard')[] = ['easy', 'medium', 'hard'];
    
    for (const difficulty of difficulties) {
      const puzzlesForDifficulty = this.puzzles.get(difficulty) || [];
      
      // 生成题目直到达到最大数量
      while (puzzlesForDifficulty.length < this.maxPuzzlesPerDifficulty) {
        try {
          console.log(`生成${difficulty}难度题目 (${puzzlesForDifficulty.length + 1}/${this.maxPuzzlesPerDifficulty})`);
          const puzzle = this.generator.generatePuzzle(difficulty);
          puzzlesForDifficulty.push(puzzle);
        } catch (error) {
          console.error(`生成${difficulty}难度题目时出错:`, error);
          // 如果出错，跳出循环避免无限循环
          break;
        }
      }
      
      this.puzzles.set(difficulty, puzzlesForDifficulty);
    }
    
    console.log('数独题目预生成完成');
  }
  
  // 获取指定难度的随机题目
  public getRandomPuzzle(difficulty: 'easy' | 'medium' | 'hard'): number[][] {
    const puzzlesForDifficulty = this.puzzles.get(difficulty) || [];
    
    // 如果该难度没有预生成的题目，则实时生成一个
    if (puzzlesForDifficulty.length === 0) {
      console.warn(`没有预生成的${difficulty}难度题目，实时生成一个`);
      return this.generator.generatePuzzle(difficulty);
    }
    
    // 随机选择一个题目
    const randomIndex = Math.floor(Math.random() * puzzlesForDifficulty.length);
    return JSON.parse(JSON.stringify(puzzlesForDifficulty[randomIndex]));
  }
  
  // 获取题目库状态
  public getPuzzleBankStatus(): Record<string, number> {
    const status: Record<string, number> = {};
    for (const [difficulty, puzzles] of this.puzzles.entries()) {
      status[difficulty] = puzzles.length;
    }
    return status;
  }
}