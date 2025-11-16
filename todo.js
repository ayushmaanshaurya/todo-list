// Todo Class
class Todo {
    constructor(id, text, category, priority, dueDate = null, completed = false) {
        this.id = id;
        this.text = text;
        this.category = category;
        this.priority = priority;
        this.dueDate = dueDate;
        this.completed = completed;
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    toggleComplete() {
        this.completed = !this.completed;
        this.updatedAt = new Date();
    }

    update(text, category, priority, dueDate) {
        this.text = text;
        this.category = category;
        this.priority = priority;
        this.dueDate = dueDate;
        this.updatedAt = new Date();
    }

    isOverdue() {
        if (!this.dueDate || this.completed) return false;
        return new Date(this.dueDate) < new Date().setHours(0, 0, 0, 0);
    }

    isDueSoon() {
        if (!this.dueDate || this.completed) return false;
        const today = new Date();
        const due = new Date(this.dueDate);
        const diffTime = due - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 3 && diffDays >= 0;
    }
}

// Utility functions
class Utils {
    static formatDate(date) {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    static getDueDateStatus(dueDate) {
        if (!dueDate) return 'future';
        
        const today = new Date();
        const due = new Date(dueDate);
        const diffTime = due - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) return 'overdue';
        if (diffDays <= 3) return 'due-soon';
        return 'future';
    }

    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static generateId() {
        return Date.now().toString() + Math.random().toString(36).substr(2, 9);
    }

    static validateTodo(text, dueDate) {
        const errors = [];
        
        if (!text || text.trim().length === 0) {
            errors.push('Task text is required');
        }
        
        if (dueDate && new Date(dueDate) < new Date().setHours(0, 0, 0, 0)) {
            errors.push('Due date cannot be in the past');
        }
        
        return errors;
    }
}