/* Author: Hemil Jain, Email: hemiljain21898@gmail.com */

import React from "react";
import axios from "axios";
import Modal from "react-modal";

/* A basic fully working implementation of fetching stackoverflow questions with infinite scroll implemented,
 * not much CSS is added because that can be done as & when needed in real project developments pretty easily,
 * If there was a mockup of how the App should look like, I would've made it look exactly the same :)
 */

export class ListContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      listData: [],
      page: 1,
      prevY: 0,
      displayModal: false,
      showModalForIndex: -1,
      hasError: false
    };
  }

  componentDidMount() {
    this.getQuestions(1);
    var options = {
      root: null,
      rootMargin: "0px",
      threshold: 1.0
    };
    /* We will use IntersectionObserver to implement infinte scrolling */
    this.observer = new IntersectionObserver(this.handleObserver, options);
    this.observer.observe(this.loadingRef);
  }
  handleObserver = (entities, observer) => {
    const { page } = this.state;
    const y = entities[0].boundingClientRect.y;
    if (this.state.prevY > y) {
      this.getQuestions(page);
    }
    this.setState({ prevY: y });
  };

  /* Functino to fetch question based on page number */
  getQuestions = (page) => {
    const { listData } = this.state;
    /*
     * Hard coding URL for demonstration purposes,
     * it can be made dynamic or input controlled
     */
    const url = `https://api.stackexchange.com/search/advanced?site=stackoverflow.com&order=desc&sort=activity&filter=!9hnGssGO4&page=${page}`;
    axios
      .get(url)
      .then((res) => {
        if (res.data) {
          this.setState({
            listData: [...listData, ...res.data.items],
            page: page + 1
          });
        } else {
          this.setState({ hasError: true });
        }
      })
      .catch(() => {
        this.setState({ hasError: true });
      });
  };
  renderModal = (item) => {
    const { displayModal } = this.state;
    const customStyles = {
      content: {
        top: "50%",
        left: "50%",
        right: "auto",
        bottom: "auto",
        marginRight: "-50%",
        transform: "translate(-50%, -50%)",
        width: "50%",
        maxHeight: "60%",
        borderRadius: "15px",
        overflowY: "auto"
      }
    };
    return (
      <Modal
        isOpen={displayModal}
        onRequestClose={this.closeModal}
        style={customStyles}
        ariaHideApp={false}
      >
        <h3>{item.title}</h3>
        <span dangerouslySetInnerHTML={{ __html: item.body }} />
        <h4>
          <a href={item.link}>{item.link}</a>
        </h4>
        <button onClick={this.closeModal}>Close</button>
      </Modal>
    );
  };
  openModal = (index) => {
    this.setState({ displayModal: true, showModalForIndex: index });
  };
  closeModal = () => {
    this.setState({ displayModal: false, showModalForIndex: -1 });
  };
  render() {
    const { listData, displayModal, showModalForIndex, hasError } = this.state;
    /* Error screen, in case we are unable to fetch the data
     * you can test it by say, changing the url
     */
    if (hasError) {
      return <h1 style={{ color: "grey" }}>Oops, something went wrong!</h1>;
    }
    return (
      <React.Fragment>
        {/* Giving ordered list so that we can know how much data is being fetched with every API call */}
        <ol>
          {listData.map((item, index) => (
            <React.Fragment>
              <li
                key={index}
                style={{
                  backgroundColor: "#e1ffe9",
                  width: "auto",
                  height: "auto",
                  marginBottom: "10px",
                  padding: "5px"
                }}
              >
                <div
                  onClick={() => {
                    this.openModal(index);
                  }}
                >
                  <span>
                    <b>Author:</b> {item.owner.display_name}
                  </span>
                  <p>
                    <b>Title:</b> {item.title}
                  </p>
                  <span>
                    <b>Creation Date:</b>{" "}
                    {new Date(item.creation_date).toUTCString()}
                  </span>
                </div>
                {displayModal &&
                  showModalForIndex !== -1 &&
                  item === listData[showModalForIndex] &&
                  this.renderModal(item)}
              </li>
            </React.Fragment>
          ))}
          <li
            ref={(e) => (this.loadingRef = e)}
            style={{ background: "none", listStyle: "none" }}
          ></li>
          <div className="crop">
            <img
              src="icons/loading_icon.gif"
              alt={"Loading..."}
              width="100%"
              height="500px"
            />
          </div>
        </ol>
      </React.Fragment>
    );
  }
}
