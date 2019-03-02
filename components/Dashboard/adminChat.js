import React from 'react';
import { StyleSheet, Text, View, ScrollView, KeyboardAvoidingView } from 'react-native';
import firebase from '../../config/firebase'
import { Header, Icon, Avatar, ListItem, Button, Input } from 'react-native-elements'



export default class Admin extends React.Component{
    constructor(props) {
        super(props)
        this.state = {
            renderUid : [],
            currentUser : firebase.auth().currentUser.uid,
            currentUserName : firebase.auth().currentUser.displayName,
            currentUserPhotoUrl : firebase.auth().currentUser.photoURL,
            selectedId :'',
            selectedPhotoUrl: '',
            selectedName: '',
            messages : [], 
            msgText: ''
        }
        this.sendMessage = this.sendMessage.bind(this)
    }


    componentDidMount() {
        const { renderUid, currentUser, users } = this.state
        firebase.database().ref("/adminChat/").on("child_added", snap => {
            var snapData = snap.val()

            if (snapData.recieverId == currentUser) {
                renderUid.push(snapData)
                this.setState({
                    renderUid
                })
            }

            if (snapData.senderId == currentUser) {

                renderUid.push(snapData)
                this.setState({
                    renderUid
                })
            }



        })

    }


    sendMessage() {
        const { selectedId, msgText, selectedName, selectedPhotoUrl, currentUser, currentUserName, currentUserPhotoUrl } = this.state
        var obj = {
            senderId: currentUser,
            recieverId: selectedId,
            text: msgText,
            // postKey: selectedObj.key,
            senderPhotoUrl: currentUserPhotoUrl,
            recieverPhotoUrl: selectedPhotoUrl,
            senderName: currentUserName,
            recieverName: selectedName
        }
        // console.log("sendMessage sendMessagesendMessage sendMessage",obj)
        firebase.database().ref("/adminChat/Messages/").push(obj)
        this.setState({
            sendMsg: false,
            text: '',
            msgText: ''
        })
    }



    fetchMessage(uid, name, photoURL) {
        const { currentUser,messages } = this.state
        console.log("uid uid uid uid uid uid", uid, name, photoURL)

        firebase.database().ref("/adminChat/Messages/").on("child_added", snap => {
            var msg = snap.val()
            msg.key = snap.key

            console.log("Condition Condition Condition Condition ", msg.recieverId == currentUser, msg.senderId == uid, msg.recieverId == currentUser, msg.senderId == uid)

            if (msg.recieverId == currentUser && msg.senderId == uid || msg.recieverId == uid && msg.senderId == currentUser) {
                console.log("componentWillMount componentWillMount componentWillMount", msg)

                messages.push(msg)
            }
        })

        console.log("messages messages messages messages", messages)

        this.setState({
            messages,
            selectedId: uid,
            selectedName: name,
            selectedPhotoUrl: photoURL
        })

    }


    static navigationOptions = {
        drawerLabel: 'Admin',
        drawerIcon: ({ tintColor }) => {
            return <Avatar icon={{ name: 'admin', color: "black", type: 'font-awesome' }} />
        }
    }


    render() {
        const { renderUid, currentUser, selectedId, messages, msgText } = this.state
        return(
            <View>
                <View>
                    <Header
                        leftComponent={{ icon: 'menu', color: '#fff', onPress: () => { this.props.navigation.toggleDrawer() } }}
                        // centerComponent={<Button title="See Projects" onPress={() => { console.log("FORM FORM FORM FORM") }} />}
                        centerComponent={{ text: 'Freelancer World', style: { color: '#fff' } }}
                        rightComponent={<Avatar rounded
                            source={{
                                onPress: () => {this.props.navigation.navigate('Profile')},
                                uri:
                                    firebase.auth().currentUser.photoURL,
                            }} />
                        }
                    />
                </View >

                <ScrollView>
{!selectedId ?
                     <View>
                    {renderUid.length > 0 ? 
                    <View>
                        {renderUid.map((value, index) => {
                            if (value.senderId === currentUser) {
                                return (<View>

                                    <View style={{marginBottom:10}}>
                                        <ListItem onPress={this.fetchMessage.bind(this, value.recieverId, value.recieverName, value.recieverPhotoUrl)}
                                            key={index}
                                            leftAvatar={{ source: { uri: value.recieverPhotoUrl } }}
                                            title={value.recieverName}
                                            subtitle={value.text}
                                        />
                                    </View>
                                </View>)
                            }
                            else if (value.recieverId === currentUser) {
                                return <View>

                                    <View>
                                        <ListItem  onPress={this.fetchMessage.bind(this, value.senderId, value.senderName, value.senderPhotoUrl)}
                                            key={index}
                                            leftAvatar={{ source: { uri: value.senderPhotoUrl } }}
                                            title={value.senderName}
                                            subtitle={value.text}
                                        />
                                        {/* <Button title="Open Chat" onPress={this.fetchMessage.bind(this, value.senderId, value.senderName, value.senderPhotoUrl)} /> */}
                                    </View>
                                </View>
                            }
                        })}
                    </View> 
                    : 
                    <View style={styles.container}><Text>No Messages from admin....</Text></View>}
                </View> : 
            
            <View>
                <KeyboardAvoidingView behavior="position">
                        <View>
                            <View  style={{flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center', marginTop : 50}}>
                            <Button title="Back" onPress={() => { this.setState({ selectedId: '', messages: [], selectedName: '', selectedPhotoUrl: '' }) }} />
                            </View>
                            {messages.length > 0 ?
                                <View style={{ marginTop: 60 }}>
                                    {messages.map((value, index) => {
                                        return <View style={{ bottom: 70 }}>
                                            {value.senderId == currentUser ?
                                            <ListItem
                                            key={index}
                                            rightAvatar={<Avatar rounded
                                                source={{
                                                    uri:
                                                        value.senderPhotoUrl,
                                                }} />}
                                            title={<Text style={{padding:10, borderRadius:4,  backgroundColor: '#439DD5', textAlign: "right", color: "white", marginLeft:10}}>{value.text}</Text>}
                                            // subtitle={value.text}
                                        />
                                                 :
                                                <ListItem
                                                    key={index}
                                                    leftAvatar={<Avatar rounded
                                                        source={{
                                                            uri:
                                                                value.senderPhotoUrl,
                                                        }} />}
                                                    title={<Text style={{width:'80%', backgroundColor:"#D5DBDB",marginRight:10,padding:10, borderRadius:4}}>{value.text}</Text>}
                                                    // subtitle={value.text}
                                                />
                                            }
                                        </View>
                                    })}

                                </View>
                                :
                                <View style={styles.container}><Text>No Messages</Text></View>}


                            <View style={{ bottom: 50}}>
                                <Input rightIcon={<Button containerStyle={{borderRadius:100}} icon={<Icon name='send' color="white" />}  onPress={this.sendMessage} />}
                                    placeholder='write a message.....'
                                    shake={true}
                                    value={msgText}
                                    label="Message"
                                    onChange={(e) => { this.setState({ msgText: e.nativeEvent.text }) }}
                                />

                            </View>

                        </View>
                    </KeyboardAvoidingView>
            </View>
        }


                </ScrollView>


                
            </View>
        )
    }
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        



    },
    
});