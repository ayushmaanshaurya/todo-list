// Storage Manager
class StorageManager {
    static STORAGE_KEY = 'advanced-todos-v2';

    static saveTodos(todos) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(todos));
            return true;
        } catch (error) {
            console.error('Error saving todos:', error);
            return false;
        }
    }

    static loadTodos() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (!stored) return [];
            
            const parsed = JSON.parse(stored);
            return parsed.map(todoData => {
                return new Todo(
                    todoData.id,
                    todoData.text,
                    todoData.category,
                    todoData.priority,
                    todoData.dueDate,
                    todoData.completed
                );
            });
        } catch (error) {
            console.error('Error loading todos:', error);
            return [];
        }
    }
}