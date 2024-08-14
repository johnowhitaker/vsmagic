import * as vscode from 'vscode';
import { workspace, NotebookDocument, Range } from 'vscode';

async function updateCellContent(notebookDocument: NotebookDocument, cellIndex: number, newContent: string) {
    const cell = notebookDocument.cellAt(cellIndex);
    if (!cell) {
        console.error('Cell index is out of range.');
        return;
    }

    const edit = new vscode.WorkspaceEdit();
    const range = new Range(0, 0, cell.document.lineCount, cell.document.lineAt(cell.document.lineCount - 1).range.end.character);
    edit.replace(cell.document.uri, range, newContent);

    await workspace.applyEdit(edit);
}

function insertCodeCellBelow() {
    vscode.commands.executeCommand('notebook.cell.insertCodeCellBelow');
}

function insertMarkdownCellBelow() {
    vscode.commands.executeCommand('notebook.cell.insertMarkdownCellBelow');
}

export function activate(context: vscode.ExtensionContext) {
    console.log('Jupyter extension is now active!');

    let disposable = vscode.commands.registerCommand('extension.modifyJupyterNotebook', async () => {
        const editor = vscode.window.activeNotebookEditor;
        if (!editor) {
            vscode.window.showInformationMessage('No active notebook editor!');
            return;
        }

        const notebook = editor.notebook;
        const currentCellIndex = editor.selection.start;

        if (currentCellIndex !== undefined) {
            // Log current cell content
            const currentCellContent = notebook.cellAt(currentCellIndex).document.getText();
            console.log('Current cell content:', currentCellContent);
            vscode.window.showInformationMessage(`Current cell content logged to console.`);

            // Log full notebook content
            console.log('Full notebook content:');
            notebook.getCells().forEach((cell, index) => {
                console.log(`Cell ${index} type:`, cell.kind); // 2 is CodeAction, 1 is Markdown
                console.log(`Cell ${index}:`, cell.document.getText());
            });
            vscode.window.showInformationMessage(`Full notebook content logged to console.`);

            // Option 1: Modify cell itself:
            await updateCellContent(notebook, currentCellIndex, currentCellContent + '\nprint("Hello Jupyter")');
            
            
            //Option 2: Add new cell, wait, modify
            // insertCodeCellBelow();
            // await new Promise(resolve => setTimeout(resolve , 500));
            // const newCellIndex = editor.selection.start; // The new cell is inserted below the current cell and cursor moves there
            // await updateCellContent(notebook, newCellIndex, 'print("Hello Jupyter")');


            vscode.window.showInformationMessage(`New cell added below the current cell.`);
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}