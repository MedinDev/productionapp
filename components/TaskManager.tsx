import React, {useState} from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Modal,
} from "react-native";
import {Calendar} from "react-native-calendars";


type TaskStatus = 'Not Started' | 'In Progress' | 'Completed'
type Task = {
    id:string;
    title:string;
    description:string;
    status:TaskStatus;
    dueDate?: string;
}

export default function TaskManager(){
    const [tasks, setTasks] = useState<Task[]>([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus ] = useState<TaskStatus>('Not Started');
    const [dueDate, setDueDate] = useState<string | undefined>(undefined);
    const [editId, setEditId] = useState<string | null>(null);
    const [selectCalendarVisible, SetSelectCalendarVisible] = useState(false);
    const [viewCalendarVisible, setViewCalendarVisible] = useState(false);
    const [showAnalytics, setShowAnalytics] = useState(false);

    const handleSave = () =>{
        if (!title.trim()) return;

        const newTask: Task = {
            id: editId || Date.now().toString(),
            title,
            description,
            status,
            dueDate,
        };
        const updatedTask = editId
            ? tasks.map(t => (t.id === editId ? newTask : t))
            : [...tasks, newTask];
        setTasks(updatedTask);
        setTitle('');
        setDescription('');
        setStatus('Not Started');
        setEditId(null);
    };
    const handleEdit = (task: Task)  => {
        setTitle(task.title);
        setDescription(task.description);
        setStatus(task.status);
        setDueDate(task.dueDate);
        setEditId(task.id);
    };
    const handleDelete = (id:string) => {
        setTasks(tasks.filter(t=>t.id !== id));
    }
    const total = tasks.length;
    const completed = tasks.filter(t=>t.status === 'Completed').length;
    const inProgress = tasks.filter(t=>t.status === 'In Progress').length;
    const notStarted = tasks.filter(t=>t.status === 'Not Started').length;
    const completedPct = total ? Math.round((completed/total)*100) : 0;
    const inProgressPct = total ? Math.round((inProgress/total)*100) : 0;
    const notStartedPct = total ? Math.round((notStarted/total)*100) : 0;
    const getProductivity = () =>{
        if (completedPct >= 70) return 'High';
        if (completedPct >= 40) return 'Medium';
        return 'low'
    };
    const markedDeadlines = tasks.reduce((acc, task) => {
        if (task.dueDate){
            acc[task.dueDate] = {
                marked: true,
                dotColor: '#007bff',
                activeOpacity: 0
            };
        }
        return acc;
    }, {} as Record<string, {marked: boolean; dotColor: string; activeOpacity: number}>);

    return (
        <>
           <KeyboardAvoidingView
               style={styles.container}
               behavior={Platform.OS === 'ios' ? 'padding' : undefined}
           >
               {total > 0 && (
                   <TouchableOpacity
                       style={styles.progressToggle}
                       onPress={() => setShowAnalytics(prev => !prev)}>
                       <Text style={styles.progressToggleText}>Progress</Text>
                   </TouchableOpacity>
               )}
               <text style={styles.header}>Task Manager</text>
               <TextInput
                   style={styles.input}
                   placeholder={'Task Title'}
                   value={title}
                   onChangeText={setTitle}
               />
               <TextInput
                   style={styles.input}
                   placeholder={'Task Description'}
                   value={description}
                   onChangeText={setDescription}
               />
               <View style={styles.container}>
                   {(['Not Started', 'In Progress', 'Completed'] as TaskStatus[]).map(s =>(
                       <TouchableOpacity
                       key={s}
                       style={[styles.statusButton, status === s && styles.statusSelected]}>
                           <Text style={styles.statusText}>{s}</Text>
                       </TouchableOpacity>
                   ))}
               </View>
               <View style={styles.dueDateContainer}>
                   <Text style={{fontWeight:'bold'}}>
                       Due Date: {dueDate ? dueDate: 'None'}
                   </Text>
                   <TouchableOpacity
                   onPress={() => setViewCalendarVisible(true)}
                   style={styles.calendarButton}
                   >
                       <Text style={styles.calendarButtonText}>Select Due Date</Text>
                   </TouchableOpacity>
               </View>
               <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                   <Text style={styles.saveButtonText}>{editId ? 'Update Task': 'Add Task'}</Text>
               </TouchableOpacity>
               <FlatList
                   data={tasks}
                   keyExtractor={item => item.id}
                   numColumns={3}
                   contentContainerStyle={styles.list}
                   renderItem={({item})=> (
                       <View style={styles.card}>
                           <Text style={styles.cardTitle}>{item.title}</Text>
                           <Text style={styles.cardDescription}>{item.description}</Text>
                           <Text style={styles.cardStatus}>{item.status}</Text>
                           <Text style={styles.cardDueDate}>
                               Dui:{item.dueDate ? item.dueDate : 'No deadline'}</Text>
                           <View style={styles.cardButtons}>
                               <TouchableOpacity onPress={() => handleEdit(item)}>
                                   <Text style={styles.edit}>Edit</Text>
                               </TouchableOpacity>
                               <TouchableOpacity onPress={() => handleDelete(item.id)}>
                                   <Text style={styles.delete}>Delete</Text>
                               </TouchableOpacity>
                           </View>
                       </View>
                   )}
               />
               {showAnalytics && total > 0 && (
                   <View style={styles.analytics}>
                       <Text style={styles.analyticsTitle}>Analytics</Text>
                       <Text style={styles.analyticsText}>Total Tasks: {total}</Text>
                       <Text style={styles.analyticsText}>Completed: {completed}%</Text>
                       <Text style={styles.analyticsText}>In Progress: {inProgressPct}%</Text>
                       <Text style={styles.analyticsText}>Not Started: {notStartedPct}%</Text>
                       <Text style={styles.analyticsText}>Productivity: {getProductivity()}</Text>
                       <Text
                            style={[
                                styles.productivity,
                                {
                                    color:getProductivity() === 'High' ? '#28a745' : getProductivity() === 'Medium' ? '#ffc107' : '#dc3545'
                                }
                            ]}>
                           {getProductivity()}
                       </Text>
                   </View>
               )}
               <TouchableOpacity
               style={styles.viewCalendarButton}
               onPress={() => setViewCalendarVisible(true)}>
                   <Text style={styles.viewCalendarButtonText}>View Calendar</Text>
               </TouchableOpacity>
           </KeyboardAvoidingView>
            <Modal visible={selectCalendarVisible} transparent animationType='slide'>
                <view style={styles.modalBackground}>
                    <view style={styles.calendarContainer}>
                        <Calendar
                            onDayLongPress={day => {
                                setDueDate(day.dateString);
                                setSelectCalendarVisible(false);
                            }}
                            markedDates = {
                            dueDate ? {
                                [dueDate]: {
                                    selected: true,
                                    selectedColor: '#2196F3',
                                    selectedTextColor: '#FFFFFF'
                                },
                            }
                            : {}
                            }
                            />
                        <TouchableOpacity
                        style={styles.closeCalendarButton}
                        onPress={() => setSelectCalendarVisible(false)}>
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </view>
                </view>
            </Modal>
            <Modal visible={viewCalendarVisible} transparent animationType={'slide'}>
                <View style={styles.modalBackground}>
                    <View style={styles.calendarContainer}>
                        <Calendar markedDates={markedDeadlines} />
                        <TouchableOpacity
                        style={styles.closeCalendarButton}
                        onPress={() => setViewCalendarVisible(false)}>
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    container: {flex: 1, backgroundColor: '#fff', padding: 16},
    header: {fontSize: 24, fontWeight: 'bold', marginBottom: 16},
    input: {borderWidth: 1, borderColor: '#ccc', padding: 8, marginBottom: 16, borderRadius: 8},
    statusContainer: {flexDirection: 'row',justifyContent: 'space-between', marginBottom: 16},
    statusButton: {padding: 8, borderRadius: 8, marginRight: 8, backgroundColor: '#ccc', alignItems: 'center'},
    statusSelected: {backgroundColor: '#d0f0c0'},
    statusText: {color: '#2196F3',fontSize: 12},
    dueDateContainer: {flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16},
    calendarButton: {padding: 8, borderRadius: 8, backgroundColor: '#2196F3', alignItems: 'center'},
    calendarButtonText: {color: 'white', fontWeight: 'bold'},
    modalBackground: {flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)'},
    calendarModalBackground: {flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)'},
    calendarModalContainer: {flex: 1, padding: 16},
    calendarModalCloseButton: {alignSelf: 'flex-end'},
    calendarModalCloseButtonText: {color: 'white', fontWeight: 'bold'},
    calendarModalSelectCalendarButton: {padding: 8, borderRadius: 8, backgroundColor: '#2196F3', alignItems: 'center'},
    calendarModalSelectCalendarButtonText: {color: 'white', fontWeight: 'bold'},
    calendarModalCalendarContainer: {flex: 1, padding: 16},
    calendarModalCloseCalendarButton: {alignSelf: 'flex-end'},
    calendarModalSaveButton: {padding: 8, borderRadius: 8, backgroundColor: '#2196F3', alignItems: 'center'},
    calendarModalSaveButtonText: {color: 'white', fontWeight: 'bold'},
    calendarContainer: {flex: 1, padding: 16},
    closeCalendarButton: {alignSelf: 'flex-end'},
    closeButtonText: {color: 'white', fontWeight: 'bold'},
    saveButton: {padding: 8, borderRadius: 8, backgroundColor: '#2196F3', alignItems: 'center'},
    saveButtonText: {color: 'white', fontWeight: 'bold'},
    card: {backgroundColor: '#fff', padding: 16, marginBottom: 16, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between',flex:1},
    cardTitle: {fontSize: 16, fontWeight: 'bold', marginBottom: 8},
    cardDescription: {color: '#666', marginBottom: 8},
    cardStatus: {color: '#2196F3', fontSize: 12},
    cardDueDate: {color: '#666', marginBottom: 8},
    cardButtons: {flexDirection: 'row', justifyContent: 'space-between'},
    edit: {color: '#2196F3', marginRight: 8},
    delete: {color: '#dc3545'},
    analytics: {padding: 16, backgroundColor: '#fff', marginBottom: 16, borderRadius: 8},
    analyticsTitle: {fontSize: 20, fontWeight: 'bold', marginBottom: 16},
    analyticsText: {color: '#666', marginBottom: 8},
    productivity: {fontSize: 20, fontWeight: 'bold', marginTop: 16},
    viewCalendarButton: {padding: 8, borderRadius: 8, backgroundColor: '#2196F3', alignItems: 'center'},
    viewCalendarButtonText: {color: 'white', fontWeight: 'bold'},
    list: {flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between'},
    listTitle: {fontSize: 20, fontWeight: 'bold', marginBottom: 16},
    listText: {color: '#666', marginBottom: 8},
    listButton: {padding: 8, borderRadius: 8, backgroundColor: '#2196F3', alignItems: 'center'},
    listButtonText: {color: 'white', fontWeight: 'bold'},
    listContainer: {flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16},
    listCard: {backgroundColor: '#fff', padding: 16, marginBottom: 16, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between',flex:1},
    listCardTitle: {fontSize: 16, fontWeight: 'bold', marginBottom: 8},
    listCardDescription: {color: '#666', marginBottom: 8},
    listCardStatus: {color: '#2196F3', fontSize: 12},
    listCardDueDate: {color: '#666', marginBottom: 8},
    listCardButtons: {flexDirection: 'row', justifyContent: 'space-between'},
    listEdit: {color: '#2196F3', marginRight: 8},
    listDelete: {color: '#dc3545'},
    listAnalytics: {padding: 16, backgroundColor: '#fff', marginBottom: 16, borderRadius: 8},
    listAnalyticsTitle: {fontSize: 20, fontWeight: 'bold', marginBottom: 16},
    listAnalyticsText: {color: '#666', marginBottom: 8},
    listProductivity: {fontSize: 20, fontWeight: 'bold', marginTop: 16},
    listViewCalendarButton: {padding: 8, borderRadius: 8, backgroundColor: '#2196F3', alignItems: 'center'},
    listViewCalendarButtonText: {color: 'white', fontWeight: 'bold'},
    listModalBackground: {flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)'},
    listCalendarContainer: {flex: 1, padding: 16},
    listCloseCalendarButton: {alignSelf: 'flex-end'},
    listCloseButtonText: {color: 'white', fontWeight: 'bold'},
    listSelectCalendarButton: {padding: 8, borderRadius: 8, backgroundColor: '#2196F3', alignItems: 'center'},
    listSelectCalendarButtonText: {color: 'white', fontWeight: 'bold'},
})