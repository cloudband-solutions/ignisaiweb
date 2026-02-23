import React from "react";
import { Button, Modal } from "react-bootstrap";
import Loader from "./Loader";

export default ConfirmationModal = (props) => {
  return (
    <Modal
      show={props.show}
    >
      <Modal.Header>
        {props.header || "Confirmation"}
      </Modal.Header>
      <Modal.Body>
        {props.isLoading &&
          <Loader/>
        }
        {!props.isLoading &&
          <p>
            {props.content || "Are you sure?"}
          </p>
        }
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="primary"
          disabled={props.isLoading}
          onClick={props.onPrimaryClicked}
        >
          Confirm
        </Button>
        <Button 
          variant="secondary"
          disabled={props.isLoading}
          onClick={props.onSecondaryClicked}
        >
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
