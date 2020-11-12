import React from "react";
import firebase from "@firebase/app";
import "@firebase/firestore";
import "@firebase/auth";
import "./style.css";

import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";


// Initialize Firebase
firebase.initializeApp({});
const store = firebase.firestore();
const auth = firebase.auth();

export default () => {
  const [user] = useAuthState(auth);

  return <section>{user ? <ChatRoom /> : <SignIn />}</section>;
};

function ChatRoom() {
  const messageBox = React.useRef(null);
  const messagesRef = store.collection("messages");
  const query = messagesRef.orderBy("createdAt").limit(25);
  const [messages] = useCollectionData(query, { idField: "id" });
  const { uid, photoURL, displayName: name } = auth.currentUser;

  async function sendMessageHandler() {
    const createdAt = new Date();
    await messagesRef.add({
      text: messageBox.current.value,
      createdAt,
      uid,
      photoURL,
    });
  }

  return (
    <section className="container-chatbox">
      <SignOut />
      {messages && <Messages name={name} messages={messages}></Messages>}
      <div className="container-message-input">
        <label htmlFor="message">Message:</label>
        <input type="text" id="message" name="message" ref={messageBox} />
        <button onClick={sendMessageHandler}>Send</button>
      </div>
    </section>
  );
}

function Messages({ messages, name }) {
  return (
    <section className="container-messages">
      <ul>
        {messages.map((message) => (
          <li key={message.id}>
            <h4>{name ?? "unknown"} says :</h4>
            <div>{message.text}</div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function SignOut() {
  const {displayName} = auth.currentUser;
  return (
  auth.currentUser && <button className="signout-button" onClick={(e) => auth.signOut()}>Signout {displayName}</button>
  );
}

function SignIn() {
  const googleSignInHandler = (_) => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).then((value) => {});
  };

  return (
    <div className="container-signin">
      <button onClick={googleSignInHandler}>Sign in with google</button>
    </div>
  );
}
