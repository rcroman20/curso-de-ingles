

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Trash, CheckSquare } from "lucide-react"; // Importa el ícono de basura (Trash)
import { getAuth } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js";
import { database, ref, set, remove } from "../../../../firebase-config";
import {
  getDatabase,
  ref as dbRef,
  onValue,
  push,
} from "https://www.gstatic.com/firebasejs/9.17.2/firebase-database.js";
import "./Schedule.css";

const Schedule = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [uid, setUid] = useState(null);
  const [taskDates, setTaskDates] = useState([]);
  const [countdowns, setCountdowns] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal para agregar tarea
  const [newTask, setNewTask] = useState({
    date: "",
    title: "",
    time: "",
    progress: "",
    highlight: false,
  });

  const auth = getAuth();
  const user = auth.currentUser;

  // Función para cambiar de mes
  const changeMonth = (step) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev.getFullYear(), prev.getMonth() + step, 1);
      return newDate;
    });
  };

  // Obtener datos del mes actual
  const formattedMonth = currentDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });
  const firstDay = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();
  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const today = new Date();
  const isCurrentMonth =
    today.getFullYear() === currentDate.getFullYear() &&
    today.getMonth() === currentDate.getMonth();

    useEffect(() => {
      setTaskDates(
        tasks.map((task) => {
          const localDate = parseUTCDateAsLocal(task.date);
          return `${localDate.getFullYear()}-${(localDate.getMonth() + 1)
            .toString()
            .padStart(2, "0")}-${localDate.getDate().toString().padStart(2, "0")}`;
        })
      );
    }, [tasks]);
    
    

  useEffect(() => {
    if (user) {
      setUid(user.uid);
    }
  }, [user]);

  // Fetch tasks from Realtime Database
  useEffect(() => {
    if (uid) {
      const db = getDatabase();
      const tasksStudentsRef = dbRef(db, `tasks/${uid}/tasksStudents`);
      const tasksRef = dbRef(db, `tasks/${uid}`);
  
      onValue(tasksStudentsRef, (snapshot) => {
        const data = snapshot.val();
        const tasksArray = data
          ? Object.keys(data)
              .map((key) => {
                const taskDate = new Date(data[key].date);
                if (isNaN(taskDate)) return null;
                return {
                  id: key,
                  date: taskDate.toISOString(),
                  title: data[key].title,
                  time: data[key].time,
                  progress: data[key].progress,
                  highlight: data[key].highlight || false,
                  isFromTasksStudents: true,
                };
              })
              .filter((task) => task !== null)
          : [];
  
        setTasks((prev) => {
          // Combinar ambas listas sin duplicados
          const otherTasks = prev.filter((t) => !t.isFromTasksStudents);
          return [...otherTasks, ...tasksArray].sort((a, b) => new Date(a.date) - new Date(b.date));
        });
      });
  
      onValue(tasksRef, (snapshot) => {
        const data = snapshot.val();
        const tasksArray = data
          ? Object.keys(data)
              .map((key) => {
                const taskDate = new Date(data[key].date);
                if (isNaN(taskDate)) return null;
                return {
                  id: key,
                  date: taskDate.toISOString(),
                  title: data[key].title,
                  time: data[key].time,
                  progress: data[key].progress,
                  highlight: data[key].highlight || false,
                  isFromTasksStudents: false,
                };
              })
              .filter((task) => task !== null)
          : [];
  
        setTasks((prev) => {
          // Combinar ambas listas sin duplicados
          const studentTasks = prev.filter((t) => t.isFromTasksStudents);
          return [...studentTasks, ...tasksArray].sort((a, b) => new Date(a.date) - new Date(b.date));
        });
      });
    }
  }, [uid]);
  
  
  

  // Calcular la cuenta regresiva para cada tarea
  const getTimeRemaining = (taskDate) => {
    const now = new Date();
    const taskDateObj = new Date(taskDate);

    // Check if taskDate is valid
    if (isNaN(taskDateObj)) {
      return "Fecha inválida"; // Return a message if the date is invalid
    }

    const timeDifference = taskDateObj - now;

    if (timeDifference <= 0) return "Tarea pasada";

    const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor(
      (timeDifference % (1000 * 60 * 60)) / (1000 * 60)
    );
    return `${days} días, ${hours} horas, ${minutes} minutos`;
  };

  // Actualizar la cuenta regresiva cada segundo
  useEffect(() => {
    const intervalId = setInterval(() => {
      const updatedCountdowns = {};
      tasks.forEach((task) => {
        updatedCountdowns[task.date] = getTimeRemaining(task.date);
      });
      setCountdowns(updatedCountdowns);
    }, 1000);

    // Limpiar el intervalo al desmontar el componente
    return () => clearInterval(intervalId);
  }, [tasks]);
  const parseUTCDateAsLocal = (isoDateString) => {
    const date = new Date(isoDateString);
    // Construye la fecha usando los componentes UTC, de modo que se obtenga el día original
    return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  };
  
  const formatDate = (dateString) => {
    const localDate = parseUTCDateAsLocal(dateString);
    return localDate.toLocaleDateString("es-CO", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };
  

  const hasTaskOnDay = (day) => {
    const dayString = `${currentDate.getFullYear()}-${(
      currentDate.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
    return taskDates.includes(dayString);
  };

  // Función para eliminar tarea
  const handleDeleteTask = (taskId) => {
    const taskRef = dbRef(database, `tasks/${uid}/tasksStudents/${taskId}`);
    remove(taskRef)
      .then(() => {
        // Filtramos la tarea eliminada del estado local
        setTasks(tasks.filter((task) => task.id !== taskId));
      })
      .catch((error) => {
        console.error("Error al eliminar tarea: ", error);
      });
  };

  // Función para abrir el modal de agregar tarea
  const openModal = (day) => {
    setNewTask({
      ...newTask,
      date: `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${day.toString().padStart(2, "0")}`,
    });
    setIsModalOpen(true);
  };

  // Función para manejar el cambio de los inputs del modal
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Función para formatear la fecha en formato YYYY-MM-DD
  const formatDateForFirebase = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Mes en 2 dígitos
    const day = date.getDate().toString().padStart(2, "0"); // Día en 2 dígitos
    return `${year}-${month}-${day}`; // Formato YYYY-MM-DD
  };

  // Función para agregar la nueva tarea a la base de datos
// Función para agregar la nueva tarea a la base de datos
const handleAddTask = () => {
  // Parsear manualmente la fecha para crearla en la zona horaria local
  const [year, month, day] = newTask.date.split("-");
  const selectedDate = new Date(year, month - 1, day);
  
  const formattedDate = formatDateForFirebase(selectedDate); // Formato YYYY-MM-DD

  const taskRef = ref(database, `tasks/${uid}/tasksStudents/`);
  const newTaskRef = push(taskRef);
  set(newTaskRef, {
    date: formattedDate, // Guardar la fecha seleccionada como string formateado
    title: newTask.title,
    time: newTask.time,
    progress: newTask.progress,
    highlight: newTask.highlight || false,
  })
    .then(() => {
      // Cerrar el modal después de agregar la tarea
      setIsModalOpen(false);
      // Limpiar los campos del formulario de tarea
      setNewTask({
        date: "",
        title: "",
        time: "",
        progress: "",
        highlight: false,
      });
    })
    .catch((error) => {
      console.error("Error al agregar tarea: ", error);
    });
};



  return (
    <div className="schedule-container">
      {/* 📅 Calendario a la Izquierda */}
      <div className="calendar-section">
        <div className="calendar-header">
          <button className="nav-button" onClick={() => changeMonth(-1)}>
            <ChevronLeft />
          </button>
          <h2>{formattedMonth}</h2>
          <button className="nav-button" onClick={() => changeMonth(1)}>
            <ChevronRight />
          </button>
        </div>
        <div className="weekdays">
          {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
        <div className="calendar-days">
          {[...Array(firstDay)].map((_, i) => (
            <span key={`empty-${i}`} className="calendar-day empty"></span>
          ))}
          {[...Array(daysInMonth)].map((_, i) => {
            const day = i + 1;
            return (
              <span
                key={day}
                className={`calendar-day ${
                  isCurrentMonth && day === today.getDate() ? "current-day" : ""
                } ${hasTaskOnDay(day) ? "has-task" : ""}`}
                onClick={() => openModal(day)}
              >
                {day}
              </span>
            );
          })}
        </div>
      </div>

      {/* 📋 Lista de Tareas a la Derecha */}
      <div className="schedule-section">
        <h3 className="schedule-title"><CheckSquare/> Schedule</h3>
        {tasks.length > 0 ? (
  tasks
    .slice() // Crear una copia para evitar mutaciones
    .sort((a, b) => new Date(a.date) - new Date(b.date)) // Ordenar por fecha
    .map((task, index) => (
      <div key={index} className={`schedule-item ${task.highlight ? "highlight" : ""}`}>
        <p>
          <strong>{formatDate(task.date)}</strong>{" "}
          {task.isFromTasksStudents && (
            <button className="delete-task-btn" onClick={() => handleDeleteTask(task.id)}>
              <Trash size={14} />
            </button>
          )}
        </p>
        <p>{task.title}</p>
        <p>{task.time}</p>
        <p className="progress-text">{task.progress}</p>
        <p className="deadline">
          <strong>Deadline:</strong> {countdowns[task.date]}{" "}
        </p>
      </div>
    ))
) : (
  <p>No hay tareas para mostrar.</p>
)}

      </div>

      {/* Modal para agregar tarea */}
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Agregar Tarea</h2>
            <input className="input-modal"
              type="text"
              name="title"
              value={newTask.title}
              onChange={handleInputChange}
              placeholder="Título de la tarea"
            />
            <input
              type="time"
              name="time"
              value={newTask.time}
              onChange={handleInputChange}
              placeholder="Hora"
              className="horario"
            />
            <textarea
              name="progress"
              value={newTask.progress}
              onChange={handleInputChange}
              placeholder="Descripción del progreso"
              className="text-description"
            />
            <button onClick={handleAddTask}>Agregar</button>
            <button onClick={() => setIsModalOpen(false)}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Schedule;

