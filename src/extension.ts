
import * as vscode from 'vscode';
import * as cp from 'child_process';

export function activate(context: vscode.ExtensionContext) {

	let disposable = vscode.commands.registerCommand('ollamaCopilot.suggest', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        const document = editor.document;
        const selection = editor.selection;
        const text = document.getText(selection) || document.getText();

        const modelName = vscode.workspace.getConfiguration().get<string>('ollamaCopilot.model', 'llama3.2');

        vscode.window.showInformationMessage(`Generating code with ${modelName}...`);

        const response = await queryOllama(text, modelName);

        if (response) {
            editor.edit(editBuilder => {
                editBuilder.insert(selection.active, response);
            });
        }
    });

    context.subscriptions.push(disposable);

}

// This method is called when your extension is deactivated
export function deactivate() {}

async function queryOllama(prompt: string, model: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const ollamaProcess = cp.spawn('ollama', ['run', model], { shell: true });

        let output = '';
        ollamaProcess.stdout.on('data', (data) => {
            output += data.toString();
        });

        ollamaProcess.stdin.write("Complete the following code, Do not explain, just return the code." + '\n' + prompt + '\n');
        ollamaProcess.stdin.end();

        ollamaProcess.on('close', () => resolve(output.trim()));
        ollamaProcess.on('error', (err) => reject(err));
    });
}
