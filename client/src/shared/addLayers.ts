import { alerts } from "../store";

/**
 * Display message to the user
 * @param {String} errorMessage - error message
 * @param {String} errorDetails - error details
 * @param {String} alertKind - optional: if alert kind is not provided, default to 'danger'
 */
export function addAlertMessage(errorMessage: string, errorDetails: any, alertKind: string = 'danger', title: string = 'An error occurred.') {
    alerts.subscribe(value => {
        value.mapAlert.open = true;
        value.mapAlert.setAttribute('kind', alertKind);
        value.alertMessage.textContent = errorMessage + errorDetails;
        value.alertTitle.textContent = title;
    });
}

export function setupErrorHandling(errorObj: any, settings: any = {}) {
    errorObj.criticalComponent = settings.isCriticalComponent || false;
    errorObj.on("layerview-create-error", function (evt: any) {
        console.error("Failed to create layer: ", errorObj.title, ". Error is: ", evt.error.message, ". Details: ", evt.error.details);
        if (errorObj.criticalComponent === true) {
            addAlertMessage('Application not available at this time. ' + errorObj.title + ' is not available. ', evt.error.message);
        } else {
            addAlertMessage('An optional layer, ' + errorObj.title + ', is not available at this time. All other aspects of the WQI are expected to function. ', evt.error.message);
        }
    });
};