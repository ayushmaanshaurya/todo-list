class TodoApp {
    constructor() {
        this.todos = StorageManager.loadTodos();
        this.filteredTodos = [...this.todos];
        this.currentFilter = {
            category: 'all',
            priority: 'all',
            status: 'all',
            search: ''
        };
        
        this.initializeEventListeners();
        this.applyFilters();
    }

    initializeEventListeners() {

        document.getElementById('add-btn').addEventListener('click', () => this.handleAddTodo());
        document.getElementById('todo-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleAddTodo();
        });


        document.getElementById('clear-completed').addEventListener('click', () => this.clearCompleted());
        document.getElementById('sort-date').addEventListener('click', () => this.sortByDate());
        document.getElementById('sort-priority').addEventListener('click', () => this.sortByPriority());

        document.getElementById('filter-category').addEventListener('change', () => this.applyFilters());
        document.getElementById('filter-priority').addEventListener('change', () => this.applyFilters());
        document.getElementById('filter-status').addEventListener('change', () => this.applyFilters());
        document.getElementById('search-input').addEventListener('input', 
            Utils.debounce(() => this.applyFilters(), 300)
        );
    }

    handleAddTodo() {
        const input = document.getElementById('todo-input');
        const text = input.value.trim();
        const category = document.getElementById('category-select').value;
        const priority = document.getElementById('priority-select').value;
        const dueDate = document.getElementById('due-date').value;

        const errors = Utils.validateTodo(text, dueDate);
        if (errors.length > 0) {
            alert(errors.join('\n'));
            return;
        }

        this.addTodo(text, category, priority, dueDate);
        input.value = '';
        document.getElementById('due-date').value = '';
    }

    addTodo(text, category, priority, dueDate) {
        const id = Utils.generateId();
        const todo = new Todo(id, text, category, priority, dueDate);
        
        this.todos.push(todo);
        this.saveAndRender();
    }

    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.toggleComplete();
            this.saveAndRender();
        }
    }

    updateTodo(id, text, category, priority, dueDate) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.update(text, category, priority, dueDate);
            this.saveAndRender();
        }
    }

    deleteTodo(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.todos = this.todos.filter(t => t.id !== id);
            this.saveAndRender();
        }
    }

    editTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            const newText = prompt('Edit your task:', todo.text);
            if (newText !== null && newText.trim() !== '') {
                this.updateTodo(id, newText.trim(), todo.category, todo.priority, todo.dueDate);
            }
        }
    }

    clearCompleted() {
        const completedCount = this.todos.filter(t => t.completed).length;
        if (completedCount === 0) {
            alert('No completed tasks to clear');
            return;
        }

        if (confirm(`Are you sure you want to clear ${completedCount} completed task(s)?`)) {
            this.todos = this.todos.filter(t => !t.completed);
            this.saveAndRender();
        }
    }

    sortByDate() {
        this.todos.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        this.applyFilters();
    }

    sortByPriority() {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        this.todos.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
        this.applyFilters();
    }

    applyFilters() {
        const categoryFilter = document.getElementById('filter-category').value;
        const priorityFilter = document.getElementById('filter-priority').value;
        const statusFilter = document.getElementById('filter-status').value;
        const searchTerm = document.getElementById('search-input').value.toLowerCase();

        this.currentFilter = {
            category: categoryFilter,
            priority: priorityFilter,
            status: statusFilter,
            search: searchTerm
        };

        this.filteredTodos = this.todos.filter(todo => {
            if (this.currentFilter.category !== 'all' && todo.category !== this.currentFilter.category) {
                return false;
            }
            
            if (this.currentFilter.priority !== 'all' && todo.priority !== this.currentFilter.priority) {
                return false;
            }

            if (this.currentFilter.status === 'active' && todo.completed) {
                return false;
            }
            
            if (this.currentFilter.status === 'completed' && !todo.completed) {
                return false;
            }
            
            if (this.currentFilter.search && !todo.text.toLowerCase().includes(this.currentFilter.search)) {
                return false;
            }
            
            return true;
        });

        this.render();
    }

    getStats() {
        const today = new Date().toDateString();
        
        return {
            total: this.todos.length,
            active: this.todos.filter(t => !t.completed).length,
            completed: this.todos.filter(t => t.completed).length,
            dueToday: this.todos.filter(t => 
                t.dueDate && 
                new Date(t.dueDate).toDateString() === today &&
                !t.completed
            ).length
        };
    }

    saveAndRender() {
        StorageManager.saveTodos(this.todos);
        this.applyFilters();
    }

    render() {
        const stats = this.getStats();
        this.renderStats(stats);
        this.renderTodoList();
    }

    renderStats(stats) {
        document.getElementById('total-count').textContent = stats.total;
        document.getElementById('active-count').textContent = stats.active;
        document.getElementById('completed-count').textContent = stats.completed;
        document.getElementById('due-today-count').textContent = stats.dueToday;
    }

    renderTodoList() {
        const todoList = document.getElementById('todo-list');
        
        if (this.filteredTodos.length === 0) {
            todoList.innerHTML = this.getEmptyStateHTML();
            return;
        }

        todoList.innerHTML = this.filteredTodos.map(todo => this.getTodoItemHTML(todo)).join('');
        this.filteredTodos.forEach(todo => {
            const checkbox = document.querySelector(`[data-id="${todo.id}"] .todo-checkbox`);
            const editBtn = document.querySelector(`[data-id="${todo.id}"] .btn-edit`);
            const deleteBtn = document.querySelector(`[data-id="${todo.id}"] .btn-delete`);

            checkbox.addEventListener('change', () => this.toggleTodo(todo.id));
            editBtn.addEventListener('click', () => this.editTodo(todo.id));
            deleteBtn.addEventListener('click', () => this.deleteTodo(todo.id));
        });
    }

    getTodoItemHTML(todo) {
        const dueDateStatus = Utils.getDueDateStatus(todo.dueDate);
        const dueDateClass = `todo-due-date ${dueDateStatus}`;
        const dueDateText = todo.dueDate ? Utils.formatDate(todo.dueDate) : 'No due date';
        const itemClass = `todo-item ${todo.completed ? 'completed' : ''} ${dueDateStatus}`;
        
        return `
            <li class="${itemClass}" data-id="${todo.id}">
                <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
                <div class="todo-content">
                    <div class="todo-text">${todo.text}</div>
                    <div class="todo-meta">
                        <span class="todo-category ${todo.category}">${todo.category}</span>
                        <span class="todo-priority ${todo.priority}">${todo.priority}</span>
                        <span class="${dueDateClass}">${dueDateText}</span>
                        <span class="todo-date">Created: ${Utils.formatDate(todo.createdAt)}</span>
                    </div>
                </div>
                <div class="todo-actions">
                    <button class="btn-edit">Edit</button>
                    <button class="btn-delete">Delete</button>
                </div>
            </li>
        `;
    }

    getEmptyStateHTML() {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">📝</div>
                <h3>No tasks found</h3>
                <p>Add a new task or change your filters</p>
            </div>
        `;
    }
}
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});