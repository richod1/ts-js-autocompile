import { expect } from 'chai';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { exec } from 'child_process';

const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const execAsync = promisify(exec);

describe('Compilation Tests', () => {
  it('should compile TypeScript files to JavaScript', async () => {
    // Run your package's CLI to compile TypeScript to JavaScript
    const { stdout } = await execAsync('node cli.js -s src -d dist');

    // Check if the compilation output contains success messages
    expect(stdout).to.include('Compiled src/example1.ts to dist/example1.js');
    expect(stdout).to.include('Compiled src/example2.ts to dist/example2.js');

    // Check if the compiled files exist
    const compiledFiles = await readdir('dist');
    expect(compiledFiles).to.include('example1.js');
    expect(compiledFiles).to.include('example2.js');

    // Optionally, you can read and compare the content of the compiled files
    const compiledFile1Content = await readFile(path.join('dist', 'example1.js'), 'utf8');
    const compiledFile2Content = await readFile(path.join('dist', 'example2.js'), 'utf8');

    // Assert that the content matches what you expect
    // You might need to adjust this based on your actual code
    expect(compiledFile1Content).to.include('Hello, TypeScript!');
    expect(compiledFile2Content).to.include('Hello again, TypeScript!');
  });

  it('should handle compilation errors', async () => {
    // Create a TypeScript file with a syntax error
    const errorFilePath = path.join('src', 'error.ts');
    await fs.promises.writeFile(errorFilePath, 'const x: number = "string";');

    // Run your package's CLI to compile TypeScript to JavaScript
    const { stderr } = await execAsync('node cli.js -s src -d dist');

    // Check if the compilation error message appears in the stderr
    expect(stderr).to.include('Error compiling src/error.ts');

    // Check if the compiled file does not exist
    const compiledFiles = await readdir('dist');
    expect(compiledFiles).to.not.include('error.js');
  });

  // Clean up created files after tests
  after(async () => {
    const errorFilePath = path.join('src', 'error.ts');
    await fs.promises.unlink(errorFilePath);
  });
});
