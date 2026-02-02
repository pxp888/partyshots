import React from "react";
import "./Welcomepage.css";

function Welcomepage() {
  return (
    <section className="welcomepage">
      <h1>Welcome to the App!</h1>
      <p>This is the landing page component.</p>

      <img
        // src="https://web1-imagestore.s3.amazonaws.com/219bbd12/a8d27060a5344df7927134aa8b172326_cat.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAWJBUSBSN6EHOYLPD%2F20260202%2Feu-north-1%2Fs3%2Faws4_request&X-Amz-Date=20260202T191756Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=0130c8e942339fe5d4ca29e1f316a4dd020ed562c4fc5ca29eb56e16837270b9"
        src="https://pxp-imagestore.s3.amazonaws.com/sm-LTPXVYMU30WQWIKYHRN4VNBR94VUID41?X-Amz-Algorithm=AWS4-HMAC-SHA256&amp;X-Amz-Credential=AKIAWJBUSBSN6EHOYLPD%2F20260202%2Feu-north-1%2Fs3%2Faws4_request&amp;X-Amz-Date=20260202T184255Z&amp;X-Amz-Expires=604800&amp;X-Amz-SignedHeaders=host&amp;X-Amz-Signature=ef04c82ce44f7ddeb16c1b98b796a84cacd96dce30bd38070b880a378625eddf"
        alt="cat"
      ></img>
    </section>
  );
}

export default Welcomepage;
