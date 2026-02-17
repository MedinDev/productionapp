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
    StyleSheet,
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
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
    const [selectCalendarVisible, setSelectCalendarVisible] = useState(false);
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
        setDueDate(undefined);
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
    };

    const handleQuickComplete = (id:string) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'Completed' } : t));
    };

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
            <View style={styles.mainContainer}>
           <KeyboardAvoidingView
               style={styles.keyboardContainer}
               behavior={Platform.OS === 'ios' ? 'padding' : undefined}
           >
               <View style={styles.headerContainer}>
                   <Text style={styles.header}>Task Manager</Text>
                   {total > 0 && (
                       <TouchableOpacity
                           style={styles.progressToggle}
                           onPress={() => setShowAnalytics(prev => !prev)}>
                           <Text style={styles.progressToggleText}>Progress</Text>
                       </TouchableOpacity>
                   )}
               </View>

               {showAnalytics && total > 0 && (
                   <View style={styles.analyticsCard}>
                       <Text style={styles.analyticsTitle}>Analytics Overview</Text>
                       <View style={styles.analyticsRow}>
                           <View style={styles.analyticsItem}>
                               <Text style={styles.analyticsLabel}>Total</Text>
                               <Text style={styles.analyticsValue}>{total}</Text>
                           </View>
                           <View style={styles.analyticsItem}>
                               <Text style={styles.analyticsLabel}>Completed</Text>
                               <Text style={[styles.analyticsValue, {color: '#4CAF50'}]}>{completed}%</Text>
                           </View>
                           <View style={styles.analyticsItem}>
                               <Text style={styles.analyticsLabel}>Pending</Text>
                               <Text style={[styles.analyticsValue, {color: '#FFC107'}]}>{inProgressPct}%</Text>
                           </View>
                       </View>
                       <Text style={styles.productivityLabel}>Productivity Status:</Text>
                       <Text
                            style={[
                                styles.productivityValue,
                                {
                                    color:getProductivity() === 'High' ? '#4CAF50' : getProductivity() === 'Medium' ? '#FFC107' : '#F44336'
                                }
                            ]}>
                           {getProductivity()}
                       </Text>
                   </View>
               )}

               <View style={styles.inputContainer}>
                   <TextInput
                       style={styles.input}
                       placeholder={'Task Title'}
                       placeholderTextColor="#999"
                       value={title}
                       onChangeText={setTitle}
                   />
                   <TextInput
                       style={[styles.input, styles.multilineInput]}
                       placeholder={'Task Description'}
                       placeholderTextColor="#999"
                       value={description}
                       onChangeText={setDescription}
                       multiline
                   />
                   
                   <View style={styles.statusContainer}>
                       {(['Not Started', 'In Progress', 'Completed'] as TaskStatus[]).map(s =>(
                           <TouchableOpacity
                           key={s}
                           style={[styles.statusButton, status === s && styles.statusButtonSelected]}
                           onPress={() => setStatus(s)}>
                               <Text style={[styles.statusButtonText, status === s && styles.statusButtonTextSelected]}>{s}</Text>
                           </TouchableOpacity>
                       ))}
                   </View>

                   <View style={styles.dateTimeRow}>
                       <TouchableOpacity
                           onPress={() => setSelectCalendarVisible(true)}
                           style={styles.dateButton}
                       >
                           <Text style={styles.dateButtonText}>
                               {dueDate ? `Due: ${dueDate}` : 'Select Due Date'}
                           </Text>
                       </TouchableOpacity>
                   </View>

                   <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                       <Text style={styles.saveButtonText}>{editId ? 'Update Task': 'Add Task'}</Text>
                   </TouchableOpacity>
               </View>

               <View style={styles.listHeader}>
                    <Text style={styles.listTitle}>My Tasks</Text>
                    <TouchableOpacity
                        style={styles.viewCalendarLink}
                        onPress={() => setViewCalendarVisible(true)}>
                        <Text style={styles.viewCalendarLinkText}>View Calendar</Text>
                    </TouchableOpacity>
               </View>

               <FlatList
                   data={tasks}
                   keyExtractor={item => item.id}
                   contentContainerStyle={styles.listContent}
                   showsVerticalScrollIndicator={false}
                   renderItem={({item})=> (
                       <View style={styles.taskCard}>
                           <View style={styles.taskHeader}>
                               <Text style={styles.taskTitle}>{item.title}</Text>
                               <View style={[styles.statusBadge, 
                                   item.status === 'Completed' ? {backgroundColor: '#E8F5E9'} : 
                                   item.status === 'In Progress' ? {backgroundColor: '#FFF8E1'} : 
                                   {backgroundColor: '#FFEBEE'}
                               ]}>
                                   <Text style={[styles.statusBadgeText,
                                       item.status === 'Completed' ? {color: '#2E7D32'} : 
                                       item.status === 'In Progress' ? {color: '#F57F17'} : 
                                       {color: '#C62828'}
                                   ]}>{item.status}</Text>
                               </View>
                           </View>
                           <Text style={styles.taskDescription}>{item.description}</Text>
                           {item.dueDate && (
                               <View style={styles.taskMetaRow}>
                                   <Ionicons name="calendar-outline" size={14} color="#8E8E93" style={{marginRight: 4}} />
                                   <Text style={styles.taskDueDate}>Due: {item.dueDate}</Text>
                               </View>
                           )}
                           
                           <View style={styles.taskFooter}>
                               {item.status !== 'Completed' && (
                                   <TouchableOpacity onPress={() => handleQuickComplete(item.id)} style={styles.actionButton}>
                                       <Ionicons name="checkmark-circle-outline" size={22} color="#4CAF50" />
                                   </TouchableOpacity>
                               )}
                               <TouchableOpacity onPress={() => handleEdit(item)} style={styles.actionButton}>
                                   <Ionicons name="create-outline" size={22} color="#007AFF" />
                               </TouchableOpacity>
                               <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionButton}>
                                   <Ionicons name="trash-outline" size={22} color="#FF3B30" />
                               </TouchableOpacity>
                           </View>
                       </View>
                   )}
               />
           </KeyboardAvoidingView>
        </View>
            <Modal visible={selectCalendarVisible} transparent animationType='slide'>
                <View style={styles.modalBackground}>
                    <View style={styles.calendarContainer}>
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
                    </View>
                </View>
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
    mainContainer: {
        flex: 1,
        backgroundColor: '#F2F2F7', // System Gray 6
    },
    keyboardContainer: {
        flex: 1,
        padding: 16,
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 10,
    },
    header: {
        fontSize: 28,
        fontWeight: '800',
        color: '#11181C',
    },
    progressToggle: {
        backgroundColor: '#007AFF',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
    },
    progressToggleText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    analyticsCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    analyticsTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 12,
        color: '#11181C',
    },
    analyticsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    analyticsItem: {
        alignItems: 'center',
        flex: 1,
    },
    analyticsLabel: {
        fontSize: 12,
        color: '#687076',
        marginBottom: 4,
    },
    analyticsValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#11181C',
    },
    productivityLabel: {
        fontSize: 14,
        color: '#687076',
        textAlign: 'center',
    },
    productivityValue: {
        fontSize: 20,
        fontWeight: '800',
        textAlign: 'center',
        marginTop: 4,
    },
    inputContainer: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    input: {
        backgroundColor: '#F9F9F9',
        borderWidth: 1,
        borderColor: '#E5E5EA',
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
        marginBottom: 12,
        color: '#11181C',
    },
    multilineInput: {
        height: 80,
        textAlignVertical: 'top',
    },
    statusContainer: {
        flexDirection: 'row',
        marginBottom: 12,
        gap: 8,
    },
    statusButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: '#F2F2F7',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    statusButtonSelected: {
        backgroundColor: '#E3F2FD',
        borderColor: '#2196F3',
    },
    statusButtonText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#687076',
    },
    statusButtonTextSelected: {
        color: '#2196F3',
    },
    dateTimeRow: {
        marginBottom: 16,
    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#F9F9F9',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E5EA',
    },
    dateButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#11181C',
    },
    saveButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    listTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#11181C',
    },
    viewCalendarLink: {
        padding: 4,
    },
    viewCalendarLinkText: {
        color: '#007AFF',
        fontSize: 14,
        fontWeight: '600',
    },
    listContent: {
        paddingBottom: 40,
    },
    taskCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    taskHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    taskTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#11181C',
        flex: 1,
        marginRight: 8,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    taskDescription: {
        fontSize: 14,
        color: '#687076',
        marginBottom: 12,
        lineHeight: 20,
    },
    taskDueDate: {
        fontSize: 12,
        color: '#8E8E93',
        fontWeight: '500',
    },
    taskMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    taskFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 16,
        borderTopWidth: 1,
        borderTopColor: '#F2F2F7',
        paddingTop: 12,
    },
    actionButton: {
        padding: 4,
    },
    // Calendar Styles (kept mostly similar but updated container references if needed)
    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    calendarContainer: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    closeCalendarButton: {
        marginTop: 16,
        backgroundColor: '#F2F2F7',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    closeButtonText: {
        color: '#007AFF',
        fontWeight: '600',
        fontSize: 16,
    },
});