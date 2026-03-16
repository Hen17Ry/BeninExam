<template>
    <div class="examens-container">
        <h1>Examens Management</h1>
        
        <div class="actions">
            <button @click="openCreateDialog">Add New Examen</button>
        </div>

        <table class="examens-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Date</th>
                    <th>Duration</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="examen in examens" :key="examen.id">
                    <td>{{ examen.id }}</td>
                    <td>{{ examen.title }}</td>
                    <td>{{ examen.date }}</td>
                    <td>{{ examen.duration }}</td>
                    <td>
                        <button @click="editExamen(examen.id)">Edit</button>
                        <button @click="deleteExamen(examen.id)">Delete</button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const examens = ref([])

const openCreateDialog = () => {
    // TODO: Implement create dialog
}

const editExamen = (id) => {
    // TODO: Implement edit functionality
}

const deleteExamen = (id) => {
    // TODO: Implement delete functionality
}

onMounted(() => {
    // TODO: Fetch examens from API
})
</script>

<style scoped>
.examens-container {
    padding: 20px;
}

.actions {
    margin: 20px 0;
}

.examens-table {
    width: 100%;
    border-collapse: collapse;
}

.examens-table th,
.examens-table td {
    padding: 10px;
    text-align: left;
    border-bottom: 1px solid #ddd;
}

button {
    margin: 0 5px;
    padding: 5px 10px;
    cursor: pointer;
}
</style>