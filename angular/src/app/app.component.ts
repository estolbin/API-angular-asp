import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'ToDo API';
  todoItems: TodoItem[];

  constructor(private httpClient: HttpClient) {
    this.todoItems = [];
  }

  ngOnInit() {
    this.fetchTasks();
  }

  private async fetchTasks() {
    try {
      const res = await this.httpClient.get<TodoItem[]>('http://localhost:5038/api/TodoItems').toPromise();
      this.todoItems = res || [];
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  }

  async createTask(value: string) {
    const task = {
      name: value,
      isComplete: false
    };
    const headers = { 'Content-Type': 'application/json' };
    try {
      await this.httpClient.post('http://localhost:5038/api/TodoItems', task, { headers: headers }).toPromise();
      this.fetchTasks();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  }

  async toggleTaskCompletion(id: number) {
    const task = this.todoItems.find(x => x.id == id);
    if (!task) return;
    task.isComplete = !task.isComplete;
    try {
      await this.updateTask(id, task);
    } catch (error) {
      console.error(`Error toggling task completion for task with id ${id}:`, error);
    }
  }

  async deleteTaskById(id: number) {
    if (!this.confirmDeleteTask()) return;
    try {
      await this.httpClient.delete(`http://localhost:5038/api/TodoItems/${id}`).toPromise();
      this.fetchTasks();
    } catch (error) {
      console.error(`Error deleting task with id ${id}:`, error);
    }
  }

  async editTaskName(id: number) {
    const task = this.todoItems.find(x => x.id == id);
    if (!task) return;
    const title = task.name;
    const result = prompt('Enter new name', title);
    if (!result) return;
    task.name = result;
    try {
      await this.updateTask(id, task);
    } catch (error) {
      console.error(`Error editing task name for task with id ${id}:`, error);
    }
  }

  private async updateTask(id: number, task: TodoItem | undefined) {
    try {
      const res = await this.httpClient.get<TodoItem>(`http://localhost:5038/api/TodoItems/${id}`).toPromise();
      task = res;
    } catch (error) {
      console.error(`Error updating task with id ${id}:`, error);
    }
  }

  private confirmDeleteTask() {
    return confirm('Are you sure?');
  }
}

interface TodoItem {
  id: number;
  name: string;
  isComplete: boolean;
}