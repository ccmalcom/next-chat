import React, { useEffect, useState } from 'react';
import { useChannel } from "./AblyReactEffect";
import styles from './AblyChatComponent.module.css';
import Ably from 'ably/promises';


const AblyChatComponent = (): JSX.Element => {
    let inputBox: HTMLTextAreaElement | null = null;
    let messageEnd: HTMLDivElement | null = null;
    const [messageText, setMessageText] = useState<string>('');
    const [receivedMessages, setReceivedMessages] = useState<any[]>([]);
    const messageTextIsEmpty = messageText.trim().length === 0;

    const [channel, ably] = useChannel('chat-demo', (message: string) => {

        const history = receivedMessages.slice(-199);
        setReceivedMessages([...history, message]);
    });

    const sendChatMessage = (messageText: string): void => {
        (channel as Ably.Types.RealtimeChannelCallbacks).publish({ name: 'chat-message', data: messageText });
        setMessageText('');
        inputBox?.focus();
    };

    const handleFormSubmission = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        sendChatMessage(messageText);
    };

    const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.charCode !== 13 || messageTextIsEmpty) {
            return;
        }
        sendChatMessage(messageText);
        event.preventDefault();
    };

    const messages = receivedMessages.map((message, index) => {
        const author = message.connectionId === (ably as Ably.Types.RealtimeCallbacks).connection.id ? 'me' : 'them';
        return <span key={index} className={styles.message} data-author={author}>{message.data}</span>;
    });

    useEffect(() => {
        messageEnd?.scrollIntoView({ behavior: 'smooth' });
    });

    return (
        <div className={styles.chatHolder}>
            <div className={styles.chatText}>
                {messages}
                <div ref={(element) => { messageEnd = element; }}></div>
            </div>
            <form onSubmit={handleFormSubmission} className={styles.form}>
                <textarea
                    ref={(element) => { inputBox = element; }}
                    value={messageText}
                    placeholder="Type a message..."
                    onChange={e => setMessageText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className={styles.textarea}
                ></textarea>
                <button type="submit" className={styles.button} disabled={messageTextIsEmpty}>Send</button>
            </form>
        </div>
    )
}

export default AblyChatComponent;
