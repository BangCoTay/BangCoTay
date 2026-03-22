import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, StyleSheet, ActivityIndicator } from 'react-native';
import { useChatMessages, useSendMessage } from '../../hooks/useChat';
import { useUserSubscription } from '../../hooks/useUsers';
import { PERSONAS, Persona } from '../../types';
import { Send } from 'lucide-react-native';

export const AICoachScreen = ({ navigation }: any) => {
  const [inputValue, setInputValue] = useState('');
  const [selectedPersona, setSelectedPersona] = useState<Persona>('coach');
  const { data: subscription } = useUserSubscription();
  const sendMessage = useSendMessage();

  const roleFilter = selectedPersona === 'coach' ? 'coach' : selectedPersona;
  const { data: chatData, isLoading } = useChatMessages(roleFilter);
  const messages = chatData?.messages || [];

  const handleSend = async () => {
    if (!inputValue.trim() || sendMessage.isPending) return;
    const msg = inputValue.trim();
    setInputValue('');
    try {
      await sendMessage.mutateAsync(msg);
    } catch (e) {
      console.error(e);
      alert('Failed to send message');
    }
  };

  const renderItem = ({ item }: any) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.messageWrapper, isUser ? styles.messageWrapperUser : styles.messageWrapperAI]}>
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
          <Text style={[styles.messageText, isUser ? styles.userText : styles.aiText]}>{item.content}</Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{PERSONAS[selectedPersona]?.name || 'AI Coach'}</Text>
        <Text style={styles.headerSubtitle}>{PERSONAS[selectedPersona]?.title || 'Your personal guide'}</Text>
      </View>
      
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <FlatList 
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.messageList}
        />
      )}
      
      <View style={styles.inputContainer}>
        <TextInput 
          style={styles.input} 
          value={inputValue}
          onChangeText={setInputValue}
          placeholder="Ask your coach anything..."
          placeholderTextColor="#9ca3af"
        />
        <TouchableOpacity style={styles.sendBtn} onPress={handleSend} disabled={sendMessage.isPending}>
          {sendMessage.isPending ? <ActivityIndicator color="#fff" /> : <Send color="#fff" size={20} />}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'Caveat_700Bold',
    fontSize: 28,
    color: '#18181B',
  },
  headerSubtitle: {
    fontFamily: 'Quicksand_500Medium',
    fontSize: 14,
    color: '#475569',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageList: {
    padding: 16,
    gap: 12,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  messageWrapperUser: {
    justifyContent: 'flex-end',
  },
  messageWrapperAI: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 16,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: '#18181B',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontFamily: 'Quicksand_500Medium',
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: '#ffffff',
  },
  aiText: {
    color: '#18181B',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    alignItems: 'center',
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: 'Quicksand_500Medium',
    fontSize: 15,
    color: '#18181B',
  },
  sendBtn: {
    backgroundColor: '#2563EB',
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
