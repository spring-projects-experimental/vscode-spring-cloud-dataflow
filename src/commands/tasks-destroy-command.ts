/*
 * Copyright 2019 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { injectable, inject } from 'inversify';
import { LanguageServerManager, NotificationManager } from '@pivotal-tools/vscode-extension-core';
import { Command, DITYPES } from '@pivotal-tools/vscode-extension-di';
import { COMMAND_SCDF_TASKS_DESTROY, LSP_SCDF_DESTROY_TASK, LANGUAGE_SCDF_TASK_PREFIX } from '../extension-globals';
import { DataflowTaskDestroyParams } from './stream-commands';
import { TYPES } from '../types';
import { ServerRegistrationManager } from '../service/server-registration-manager';
import { TasksExplorerProvider } from '../explorer/tasks-explorer-provider';
import { DataflowResponse } from '../language/scdf-language-interfaces';

@injectable()
export class TasksDestroyCommand implements Command {

    constructor(
        @inject(TYPES.ServerRegistrationManager) private serverRegistrationManager: ServerRegistrationManager,
        @inject(DITYPES.LanguageServerManager) private languageServerManager: LanguageServerManager,
        @inject(DITYPES.NotificationManager) private notificationManager: NotificationManager,
        @inject(TYPES.TasksExplorerProvider) private tasksExplorerProvider: TasksExplorerProvider
    ) {}

    get id() {
        return COMMAND_SCDF_TASKS_DESTROY;
    }

    async execute(params: DataflowTaskDestroyParams) {
        const defaultServer = await this.serverRegistrationManager.getDefaultServer();
        if (defaultServer) {
            const server = params.server || defaultServer.name;
            const p: DataflowTaskDestroyParams = {
                name: params.name,
                server: server
            };
            this.notificationManager.info(`Destroying task ${params.name}`);
            const response: DataflowResponse = await this.languageServerManager
                .getLanguageClient(LANGUAGE_SCDF_TASK_PREFIX).sendRequest(LSP_SCDF_DESTROY_TASK, p);
            this.notificationManager.info(response.message);
            this.tasksExplorerProvider.refresh();
        }
    }
}
