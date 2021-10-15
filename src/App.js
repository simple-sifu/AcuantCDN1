import React, {Component} from 'react';
// import '@babel/polyfill';
// import {Switch, Route, Redirect} from 'react-router-dom';
// import { ConnectedRouter } from 'connected-react-router'
// import {PersistGate} from 'redux-persist/es/integration/react';
// import {Provider} from 'react-redux';
import CapturePhotoConfirm from './screens/CapturePhotoConfirm';
// import EulaPage from './screens/Eula';
// import CaptureSelfie from './screens/CaptureSelfie';
// import Results from './screens/Results/index';
// import Error from './screens/Error/index';
import "./styles/main.css";
// import ProcessedImageResult from "./screens/ProcessedImageResult";
// import AcuantReactCamera from "./screens/AcuantReactCamera";
/*
global Raven
 */

class App extends Component {

    constructor(props){
        console.log("App: constructor");
        super(props);
        this.state = {
            isAcuantSdkLoaded: false
        }
        this.isInitialized = false;
        this.isIntializing = false;
    }


    componentDidMount() {
        console.log("App: componentDidMount");
        this.loadScript();  
    }

    loadScript(){
        console.log("App: loadScript");
        // Form absolute URL if not CDN
        function getWorkerURL(url){
            if(url.includes("http")){
                return url;
            } else {
                return new URL(url, window.location.origin).toString();
            }
        }
        // PATHS
        // CDN WORKER URL
        let workerURL = "https://cdn.jsdelivr.net/gh/simple-sifu/Acuant/AcuantImageProcessingWorker.min.js";
        // LOCAL WORKER URL
        // let workerURL = "/AcuantImageProcessingWorker.min.js";

        // REMOTE SDK URL
        let sdkURL = "https://cdn.jsdelivr.net/gh/simple-sifu/Acuant/AcuantJavascriptWebSdk.min.js";
        // LOCAL SDK URL
        // let sdkURL = "/AcuantJavascriptWebSdk.js";


        // Convert worker/CDN URL to ObjectURL
        window.getURL = function(url){
            console.log("url: " + url);
            const content = `importScripts( "${ getWorkerURL(url) }" );`;
            return URL.createObjectURL( new Blob( [ content ], { type: "text/javascript" } ) );
        }
        // Initialize SDK
        window.onAcuantSdkLoaded = function(){
            console.log("window.onAcuantSdkLoaded");
            this.initialize();
        }.bind(this);

        // set path to ObjectURL from CDN response
        let objPath = window.getURL(workerURL);
        window.acuantConfig = {
            path: objPath
        };

        // Retrieve SDK
        const sdk = document.createElement("script");
        sdk.type = "application/javascript";
        sdk.src = sdkURL;
        sdk.async = true;      
        document.body.appendChild(sdk);
    }

    componentDidCatch(error, errorInfo) {
        if (process.env.REACT_APP_SENTRY_SUBSCRIPTION_ID && process.env.REACT_APP_SENTRY_SUBSCRIPTION_ID.length > 0) {
            Raven.captureException(error, {extra: errorInfo});
        }
        this.props.routerHistory.push('/error/default')
    }

    initialize(){
        console.log("App: initialize");
        if(!this.isInitialized && !this.isIntializing){
            this.isIntializing = true;
            window.AcuantJavascriptWebSdk.initialize(
                (function(){
                    if(process.env.NODE_ENV === 'development'){
                        console.log("AcuantJavascriptWebSdk.initialize: btoa");
                        return btoa(`${process.env.REACT_APP_USER_NAME}:${process.env.REACT_APP_PASSWORD}`);
                    }
                    else{
                        console.log("AcuantJavascriptWebSdk.initialize: Authtoken");
                        return process.env.REACT_APP_AUTH_TOKEN;
                    }
                })(), 
                process.env.REACT_APP_ACAS_ENDPOINT,
                {
                    onSuccess:function(){
                        console.log("AcuantJavascriptWebSdk.initialize: onSuccess");
                        this.isInitialized = true;
                        this.isIntializing = false;
                        this.setState({
                            isAcuantSdkLoaded:true
                        })
                    }.bind(this),

                    onFail: function(){
                        console.log("AcuantJavascriptWebSdk.initialize: onFail");
                        this.isIntializing = false;
                        this.setState({
                            isAcuantSdkLoaded:true
                        })
                    }.bind(this)
                }, 1);
        } 
    }

    render() {
        console.log("App: render")
        
        return (
            <div className={'mainContent'}>
                {
                    this.state.isAcuantSdkLoaded && <CapturePhotoConfirm/>
                }
            </div>
        );
    }
}

export default App;
